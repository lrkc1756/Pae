from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_login import LoginManager
from flask_babel import Babel, _
from flask import request


db = SQLAlchemy()
babel = Babel()  #translations
DB_NAME = "database.db"


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'hjshjhdjah kjshkjdhjs'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    
    #Babel Configuration
    app.config['BABEL_DEFAULT_LOCALE']='de'
    app.config['BABEL_SUPPORTED_LOCALES'] = ['de', 'en', 'fr']
    app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'
    
    db.init_app(app)
    
    #Language selection from URL query (z.B. ?lang=de)
    def get_locale():
        return request.args.get('lang') or 'de'

    babel.init_app(app, locale_selector=get_locale)
    
    # After you create app:
    app.jinja_env.globals.update(_=_) #allows translation in Jinja templates


    from .views import views
    from .auth import auth

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    from .models import User, Lca
    
    with app.app_context():
        db.create_all()

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))

    return app


def create_database(app):
    if not path.exists('website/' + DB_NAME):
        db.create_all(app=app)
        print('Created Database!')