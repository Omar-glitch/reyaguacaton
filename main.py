from flask import Flask, render_template, url_for, request, copy_current_request_context, redirect
from flask import session, get_template_attribute, abort, make_response, g
from flask.json import dumps
from flask_wtf import CSRFProtect
from flask_wtf.csrf import CSRFError
from flask_pymongo import PyMongo, ObjectId
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from Form import Formulario, cambiarContrase, editarUsuario, eliminarUsuario, Register, Login

from config import DevelopmentConfig

import threading
import datetime
import os
import random
from urllib.parse import urlparse, urljoin
from itsdangerous import BadTimeSignature, URLSafeTimedSerializer

app = Flask(__name__)
app.config.from_object(DevelopmentConfig)
csrf = CSRFProtect(app)
mail = Mail(app)
mongo = PyMongo(app)
s = URLSafeTimedSerializer(app.config['SECRET_KEY'])

def getUserInfo(id):
    usuario = mongo.db.usuarios.find_one(ObjectId(id))
    return {"nombre" : usuario['usuario'], "apellido" : usuario['apellido'], "correo": usuario['correo'],"img" : usuario['img'],"descripcion" : usuario['descripcion'], "_id": str(usuario['_id']), "admin": usuario['admin']}

def enviarEmail(token, correo, nombre, apellido):
    mensaje = Message("Gracias por registrarse", sender=app.config['MAIL_USERNAME'], recipients=[correo])
    mensaje.html = render_template("correo.html", token=token, correo = correo, nombre = nombre, apellido = apellido)
    mail.send(mensaje)

def is_safe_url(target):
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc

@app.errorhandler(CSRFError)
def csrf_error(reason):
    return render_template('csrf_error.html', reason=reason.description), 400

@app.errorhandler(404)
def pageNotFound(e):
    return render_template('notfound.html', e = e), 404

@app.route('/')
def home():
    platillos = mongo.db.platillos.find().limit(9)
    bebidas = mongo.db.bebidas.find().limit(7)
    info = getUserInfo(session["_id"]) if "_id" in session else None
    return render_template('index.html', platillos = platillos, bebidas = bebidas, info = info)

@app.route('/shop')
def shop():
    platillos = mongo.db.platillos.find().limit(9)
    bebidas = mongo.db.bebidas.find().limit(7)
    info = getUserInfo(session["_id"]) if "_id" in session else None
    return render_template('shop.html', platillos = platillos, bebidas = bebidas, info = info)

@app.route('/shop/producto', methods=['POST'])
def producto():
    if "producto" not in request.json: return dumps({"error": "Mal pedido"})
    pedido = request.json['producto']
    if pedido == "platillos": cursor = mongo.db.platillos.find(); productoDiv = get_template_attribute('macro.html', "productos"); clase = "platillo"
    elif pedido == "bebidas": cursor = mongo.db.bebidas.find(); productoDiv = get_template_attribute('macro.html', "productosb"); clase = 'bebida'
    else: return dumps({"error", "error"})
    obj = []
    for producto in cursor: del producto['_id']; obj.append(productoDiv(producto))
    return dumps({"productos" : obj, "class": clase})

@app.route('/contactUs', methods=['POST', 'GET'])
def contactUs():
    info = getUserInfo(session['_id']) if "_id" in session else None
    if request.method == 'GET':
        session['timero'] = random.random() * 45
    cont = get_template_attribute('macro.html', 'contactanos')
    form = Formulario()
    return render_template('contact.html', form=form, info = info, cont = cont(form, session['timero']))

def verdad():
    g.verdad = True
    if float(request.form['tiempo']) != session['timero']:
        g.verdad = False
    session['timero'] = random.random()

@app.route('/contactUs/mensaje', methods = ['POST'])
def mensaje():
    info = getUserInfo(session['_id']) if "_id" in session else None
    cont = get_template_attribute('macro.html', 'contactanos')
    form = Formulario()
    if 'timero' in session:
        try:
            if not g.verdad: return dumps({"session" : "Error en el envío", "div": cont(form, session['timero'])}) 
        except:
            return dumps({"session" : "Error en el envío", "div": cont(form, session['timero'])})
        session['timero'] = random.random() * 45
        if '_id' not in session: return dumps({"session" : "No estas registrado pa", "div": cont(form, session['timero'])})
        if form.validate_on_submit():
            next = request.args.get('next')
            if not is_safe_url(next):
                abort(400)
            obj = {"identificador": str(info['_id']), "usuario" : info['nombre'],"apellido": info['apellido'],"correo": info['correo'],"titulo": form.titulo.data,"msg": form.comentario.data,"fecha" : datetime.datetime.now().strftime('%Y/%m/%d %I:%M:%S %p'), "img": info['img']}
            mongo.db.comentarios.insert_one(obj)
            return dumps({"success" : "Con exito pa", "div": cont(form, session['timero'])})
        return dumps({"error": [form.titulo.errors, form.comentario.errors], "div": cont(form, session['timero'])})
    return dumps({"session" : "Algo salió mal"})

@app.route('/faq')
def faq():
    session['time'] = 6
    comentarios = mongo.db.comentarios.find().limit(6)
    info = getUserInfo(session['_id']) if "_id" in session else None
    return render_template('faq.html', info = info, comentarios = comentarios)

@app.route('/faq/comentarios', methods=['POST'])
def faq_comentarios():
    if "ver" not in request.json: return dumps({"error": "Error"})
    if type(request.json['ver']) != int: return dumps({"error": "Mal pedido"}) 
    valor = request.json['ver']
    obj = []
    comentarios = mongo.db.comentarios.find().skip(valor).limit(6)
    divs = get_template_attribute('macro.html', "comentarios")
    for c in comentarios: del c['_id'] ; del c['correo']; obj.append(divs(c))
    return make_response(dumps({"coment": obj})), 200

@app.route('/faq/user', methods=['POST'])
def faqUser():
    if "_id" not in request.json : return dumps({"error": "No hay identificador"})
    try: ObjectId(request.json['_id'])
    except: return dumps({"error": "Mal identificador"})
    obj = []
    user = mongo.db.usuarios.find_one(ObjectId(request.json['_id']))
    if user == None: return dumps({"error": "Usuario no registrado"})
    information = get_template_attribute('macro.html', 'userInformation')
    del user['_id']
    del user['contrasena']
    del user['correo']
    obj.append(user)
    return dumps({"information": information(user)})

@app.route('/about')
def about():
    info = getUserInfo(session['_id']) if "_id" in session else None
    return render_template('about.html', info = info)

@app.route('/register', methods=['GET', 'POST'])
def register():
    form2 = Register()
    if request.method == "POST":
        if form2.validate_on_submit():
            next = request.args.get('next')
            if not is_safe_url(next):
                abort(400)
            cuenta = mongo.db.usuarios.find_one({"correo": form2.correo.data})
            if (cuenta != None):
                return dumps([[],[],['Este correo ya esta en uso'],[],[]])
            obj = {
                "usuario": form2.nombre.data,
                "apellido": form2.apellido.data,
                "correo": form2.correo.data,
                "contrasena": generate_password_hash(form2.contrasena.data)
            }
            token = s.dumps(obj, salt="email-config")

            @copy_current_request_context
            def enviarMensaje(token, correo, nombre, apellido):
                enviarEmail(token, correo, nombre, apellido)
            sender = threading.Thread(name="mail_sender", target=enviarMensaje, args=(token, form2.correo.data, form2.nombre.data, form2.apellido.data))
            sender.start()
            return dumps({"objeto": "Un correo se ha enviado a tu gmail, tienes 1 hora para verificarlo."})
        return dumps([form2.nombre.errors,form2.apellido.errors,form2.correo.errors,form2.contrasena.errors,form2.repetirContrasena.errors], ensure_ascii = False).encode('utf-8')
    return render_template('register.html', form2 = form2), 200

@app.route('/confirm-email/<token>')
def confirm(token):
    try:
        email = s.loads(token, salt='email-config', max_age=3600)
        obj = {
            "usuario": email['usuario'],
            "apellido": email['apellido'],
            "correo": email['correo'],
            "contrasena": email['contrasena'],
            "fecha": datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S %p"),
            "img": "user.png",
            "descripcion": "",
            "admin": False
        }
        if not mongo.db.usuarios.find_one({"correo": obj['correo']}):
            mongo.db.usuarios.insert_one(obj)
        else:
            return render_template('verificado.html', texto=True), 404
        return render_template('verificado.html', texto=False), 200
    except BadTimeSignature:
        return render_template('notfound.html'), 404

@app.route('/login', methods=['GET', 'POST'])
def login():
    form3 = Login()
    if request.method == 'POST':
        if form3.validate_on_submit():
            next = request.args.get('next')
            if not is_safe_url(next):
                abort(400)
            correo = mongo.db.usuarios.find_one({'correo': form3.correo.data})
            if correo == None:
                return dumps(['El  correo no esta registrado', ''])
            if check_password_hash(correo['contrasena'], form3.contrasena.data):
                session['_id'] = str(correo['_id'])
                return dumps('/user')
            return dumps(['', 'Contraseña inválida'], ensure_ascii=False).encode('utf-8')
        return dumps([form3.correo.errors,form3.contrasena.errors], ensure_ascii = False).encode('utf-8')
    return render_template('login.html', form=form3)

@app.route('/user', methods = ['GET', 'POST'])
def user():
    if '_id' not in session: return redirect(url_for('login'))
    form = editarUsuario()
    info = getUserInfo(session['_id'])

    if request.method == 'POST':
        if form.validate_on_submit() or form.descripcion.data != "" and form.descripcion.data != None:
            next = request.args.get('next')
            if not is_safe_url(next):
                abort(400)
            image_name = None
            if form.imagen.validate(form):
                imagen = form.imagen.data
                if imagen:
                    image_name = str(ObjectId(session['_id'])) + "." + secure_filename(imagen.filename.split('.')[-1])
                    if os.path.exists(f"{app.config['UPLOAD_FOLDER']}/{image_name}"):
                        os.remove(f"{app.config['UPLOAD_FOLDER']}/{image_name}")
                    images_dir = os.path.join(app.config['UPLOAD_FOLDER'], image_name)
                    info['img'] = image_name
                    mongo.db.usuarios.update_one({"_id" : ObjectId(session["_id"])}, {"$set": {"img": image_name}})
                    imagen.save(images_dir)
            if form.descripcion.validate(form) and form.descripcion.data != "" and form.descripcion.data != None:
                mongo.db.usuarios.update_one({"_id" : ObjectId(session["_id"])}, {"$set": {"descripcion": form.descripcion.data or ""}})
                info['descripcion'] = form.descripcion.data or ""
            vista = get_template_attribute("macro.html", "vistaPrevia")
            return dumps({"descripcion" : info['descripcion'], "div" : vista(info), "texto": form.descripcion.errors, "img": image_name}, ensure_ascii = False).encode('utf-8')
        editar = get_template_attribute("macro.html", "editar")
        return dumps({"error" : form.imagen.errors, "div": editar(info, form)}, ensure_ascii = False).encode('utf-8')
    return render_template('user.html', form = form, info = info)
    

@app.route('/imagen', methods=['POST'])
def imagen():
    if "_id" not in session: return None
    form = editarUsuario()
    if request.method == 'POST' and form.validate_on_submit():
        next = request.args.get('next')
        if not is_safe_url(next):
            abort(400)
        if form.imagen.data:
            imagen = form.imagen.data
            image_name = None
            if imagen:
                image_name = str(ObjectId(session['_id'])) + "pre." + secure_filename(imagen.filename.split('.')[-1])
                if os.path.exists(f"{app.config['UPLOAD_FOLDER']}/{image_name}"):
                    os.remove(f"{app.config['UPLOAD_FOLDER']}/{image_name}")
                images_dir = os.path.join(app.config['UPLOAD_FOLDER'], image_name)
                imagen.save(images_dir)
                return dumps({"img": image_name}, ensure_ascii = False).encode('utf-8')
    return dumps({'error': form.imagen.errors}, ensure_ascii = False).encode('utf-8')

@app.route('/eliminar', methods = ['POST'])
def eliminar():
    if "_id" not in session: return None
    form = eliminarUsuario()
    info = getUserInfo(session["_id"])
    eliminar = get_template_attribute("macro.html", "eliminar")
    if form.validate_on_submit():
        next = request.args.get('next')
        if not is_safe_url(next):
            abort(400)
        contrasena = mongo.db.usuarios.find_one(ObjectId(session["_id"]))['contrasena']
        if check_password_hash(contrasena, form.contrasena.data): 
            mongo.db.usuarios.delete_one({"_id": ObjectId(session['_id'])})
            return dumps({"exito": "ADIOS :'v"})
    eliminar = get_template_attribute("macro.html", "eliminar")
    return dumps({"eliminar": "Contraseña incorrecta", "div" : eliminar(info, form)}, ensure_ascii = False).encode('utf-8')

@app.route('/cambiarContra', methods=['POST'])
def cambiarContra():
    if "_id" not in session: return None
    form = cambiarContrase()
    info = getUserInfo(session["_id"])
    cambiar = get_template_attribute("macro.html", "cambiarContra")
    if form.validate_on_submit():
        next = request.args.get('next')
        if not is_safe_url(next):
            abort(400)
        contrasena = mongo.db.usuarios.find_one(ObjectId(session["_id"]))["contrasena"]
        vista = get_template_attribute("macro.html", "vistaPrevia")
        if check_password_hash(contrasena, form.contrasena.data):
            passwordHash = generate_password_hash(form.ncontrasena.data)
            mongo.db.usuarios.update_one({"_id": ObjectId(session["_id"])}, {"$set": {"contrasena" : passwordHash}})
            return dumps({"cambio": True, "div" : vista(info)})
        return dumps({"error": ["Contraseña incorrecta"], "div": cambiar(info, form)})
    return dumps({"error": [form.contrasena.errors, form.ncontrasena.errors], "div": cambiar(info, form)})

@app.route('/json', methods = ['POST'])
def json():
    if "_id" not in session: return None
    info = getUserInfo(session["_id"])
    objetoJson = request.get_json()
    if objetoJson != None:
        if "editar" in objetoJson: 
            form = editarUsuario()
            editar = get_template_attribute("macro.html", "editar")
            return dumps({"div": editar(info, form)})
        if "vista" in objetoJson: 
            vista = get_template_attribute("macro.html", "vistaPrevia")
            return dumps({"div": vista(info)})
        if "eliminar" in objetoJson:
            form2 = eliminarUsuario()
            eliminar = get_template_attribute("macro.html", "eliminar")
            return dumps({"div": eliminar(info, form2)})
        if "cambiar" in objetoJson:
            form3 = cambiarContrase()
            cambiar = get_template_attribute("macro.html", "cambiarContra") 
            return dumps({"div": cambiar(info, form3)})

@app.route('/session', methods=['POST'])
def sessionClose():
    if "_id" not in session: return None
    if request.json:
        if "csesion" in request.json:
            session.pop('_id')
    return dumps({"none": True})

if __name__ == '__main__':
    app.run(port=5000)