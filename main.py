from website import create_app 

app = create_app()

#runs webserver if this file is run directly
if __name__ == '__main__':
    app.run(debug=True)
    
    