from flask_wtf import FlaskForm, RecaptchaField
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import TextField, SubmitField, validators, TextAreaField, PasswordField, HiddenField

def espaciosEnBlanco(form, field):
    if len(field.data) != len(field.data.strip()):
        raise validators.ValidationError('No utilice espacios en blanco')
    if " " in field.data:
        raise validators.ValidationError('No deje espacios en blanco')

class Formulario(FlaskForm):
    titulo = TextField('Ingrese el título del mensaje', [
        validators.DataRequired(message="Este campo es requerido"),
        validators.Length(min=2, message="Ingrese un titulo mas largo"),
        validators.Length(max=15, message="Muy grande el título (max: 15)")
    ])
    comentario = TextAreaField('Ingrese su mensaje', 
                                [validators.DataRequired(message='Este campo es requerido'),
                                 validators.length(max=120, message='Texto muy grande (max: 120)')])
    tiempo = HiddenField()
    enviar = SubmitField('Enviar')

class Register(FlaskForm):
    nombre = TextField('Ingrese su nombre', 
                    [validators.DataRequired(message="Este campo es requerido"),
                     validators.length(min=3, max= 8, message="Debe tener entre 3 y 8 letras"),
                     espaciosEnBlanco])
    apellido = TextField('Ingrese su apellido', 
                    [validators.DataRequired(message="Este campo es requerido"),
                    validators.length(min=3, max=8, message="Debe tener entre 3 y 8 letras"),
                    espaciosEnBlanco])
    correo = TextField('Ingrese su correo',
                        [validators.DataRequired(message="Este campo es requerido"),
                         validators.Email(message="Este no es un correo válido")])
    contrasena = PasswordField('Ingrese su contraseña', 
                        [validators.DataRequired(message="Este campo es requerido"),
                         validators.length(min=5, max=20, message="Debe tener entre 5 y 20 letras")])
    repetirContrasena = PasswordField('Reingrese su contraseña',
                        [validators.DataRequired(message="Este campo es requerido"),
                         validators.EqualTo('contrasena', message="Las contraseñas no concuerdan")])
    honeypot = HiddenField(validators.length(max=0, message="Error en honeypot"))
    recaptcha = RecaptchaField()
    enviar = SubmitField()

class Login(FlaskForm):
    correo = TextField('', [validators.DataRequired(message="Este campo es obligatorio"), 
                            validators.Email(message="Ingrese un correo válido")])
    contrasena = PasswordField('', [validators.DataRequired('Este campo es obligatorio')])
    recaptcha = RecaptchaField()
    enviar = SubmitField()

class editarUsuario(FlaskForm):
    imagen = FileField('', validators = [FileRequired('Ingrese una nueva imagen'),
                                        FileAllowed(['jpg', 'png'], 'Solo imágenes JPG o PNG')])
    descripcion = TextAreaField('', [validators.Length(min = -1, max = 80, message="La descripción no debe ser mayor a 80 letras")])
    enviar = SubmitField()

class cambiarContrase(FlaskForm):
    contrasena = PasswordField("", [validators.DataRequired(message="El campo de contraseña es requerido")])
    ncontrasena = PasswordField("", [validators.DataRequired(message="La nueva contraseña es requerida"),
    validators.length(min=5, max=20, message="La nueva contraseña debe tener entre 5 a 20 letras")])
    enviar = SubmitField()

class eliminarUsuario(FlaskForm):
    contrasena = PasswordField('', [validators.DataRequired(message="Este campo es necesario")])
    enviar = SubmitField()

class pruebita(FlaskForm):
    texto = TextField('', [validators.DataRequired(message='abueno')])
    csrf_token = HiddenField()
    time = HiddenField()
    enviar = SubmitField()