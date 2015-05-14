function configureHttpBackend(httpBackend){
	httpBackend.whenGET(/\.html$/).respond(function () {
      return [200, ['success'], {}];
    });
    httpBackend.whenGET('/api/authenticate/identity').respond({});
}