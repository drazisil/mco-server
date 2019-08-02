import cherrypy
import ssl


class AuthLogin(object):
    @cherrypy.expose
    def index(self):
        return "Hello World!"

    @cherrypy.expose
    def AuthLogin(self, serviceID, username, version, password):
        cherrypy.response.headers['Content-Type'] = 'text/plain'
        return "Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e"


if __name__ == "__main__":
    print('Hello!')
    ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ctx.options &= ~ssl.OP_NO_SSLv3
    cherrypy.config.update("server.conf")
    cherrypy.quickstart(AuthLogin())