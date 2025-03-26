from website import create_app 

app = create_app()

#runs webserver if this file is run directly
if __name__ == '__main__':
    app.run(host='192.168.1.103', port=5000, debug=True)
    
    