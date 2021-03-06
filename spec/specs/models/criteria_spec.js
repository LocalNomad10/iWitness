describe("Criteria", function() {
  var subject, validSearchProps;

  beforeEach(function() {
    subject = IWitness.Criteria.create({
      stream:          false,
      startDateString: '1/1/2012',
      startTimeString: '9:00 AM',
      endDateString:   '1/1/2012',
      endTimeString:   '10:00 AM',
      northEast: [40.558703067949075,-82.38843461914064],
      southWest: [39.79273537420398,-83.76996538085939]
    });
  });

  describe("start", function() {
    describe("when using my timezone", function() {
      it("is the date/time as I entered it", function() {
        subject.setProperties({startDateString: '1/1/2012', startTimeString: '2:30 PM'});
        expect(subject.get('start').format('M/D/YYYY h:m A')).toEqual('1/1/2012 2:30 PM');
      });
    });

    describe("when using the map's timezone", function() {
      beforeEach(function() { subject.set('useLocalTime', false) });

      it("is the date/time adjusted for the map", function() {
        spyOnProperties(subject, {timezoneDifference: -4});
        subject.setProperties({startDateString: '1/1/2012', startTimeString: '2:30 PM'});
        expect(subject.get('start').format('M/D/YYYY h:m A')).toEqual('1/1/2012 10:30 AM');
      });
    });
  });

  describe("end", function() {
    describe("when using my timezone", function() {
      it("is the date/time as I entered it", function() {
        subject.setProperties({endDateString: '1/1/2012', endTimeString: '2:30 PM'});
        expect(subject.get('end').format('M/D/YYYY h:m A')).toEqual('1/1/2012 2:30 PM');
      });
    });

    describe("when using the map's timezone", function() {
      beforeEach(function() { subject.set('useLocalTime', false) });

      it("is the date/time adjusted for the map", function() {
        spyOnProperties(subject, {timezoneDifference: -4});
        subject.setProperties({endDateString: '1/1/2012', endTimeString: '2:30 PM'});
        expect(subject.get('end').format('M/D/YYYY h:m A')).toEqual('1/1/2012 10:30 AM');
      });
    });
  });

  describe("radius", function() {
    it("is the radius of the circular map overlay", function() {
      subject.setProperties({center: [0,1], northEast: [2,3]});

      var stub = {length: function() { return 10000 }};
      spyOn(Map, 'Line').andReturn(stub);

      expect(subject.get('radius')).toEqual(9350);

      // make sure we're taking the correct lat,lng values for our 'top' point
      expect(Map.Line).toHaveBeenCalledWith([0,1], [2,1]);
    });

    it("is 0 when center or northEast are not set", function() {
      expect(subject.get('radius')).toEqual(0);
    });
  });

  describe("errors", function() {
    it("returns an empty array for valid criteria", function() {
      expect(subject.get('errors')).toEqual([]);
    });
  });

  describe("timeError", function() {
    it("includes an error if the start comes before the end", function() {
      subject.set('endTimeString', '8:00 AM');
      expect(subject.get('timeError')).toMatch(/after the start date/i);
    });
  });

  describe("mapError", function() {
    it("includes an error if the radius is more than 75km", function() {
      spyOnProperties(subject, {radius: 76000});
      expect(subject.get('mapError')).toMatch(/zoom/i);
    });

    it("includes an error if the coordinates are not set", function() {
      subject.set('northEast', undefined);
      expect(subject.get('mapError')).toMatch(/location/i);

      subject.set('northEast', [40, 40]);
      expect(subject.get('mapError')).toBeFalsy();

      subject.set('southWest', undefined);
      expect(subject.get('mapError')).toMatch(/location/i);
    });
  });

  describe("rawStart", function() {
    it("can be set with a moment", function() {
      var m = moment('02/01/2012 11:00 AM');
      subject.set('rawStart', m);
      expect(subject.get('rawStart')).toEqual(m);
    });

    it("can be set with a string", function() {
      var m = moment('02/01/2012 11:00 AM');
      subject.set('rawStart', '02/01/2012 11:00 AM');
      expect(subject.get('rawStart')).toEqual(m);
    });

    it("sets the startDateString and startDateTime", function() {
      subject.set('rawStart', '02/01/2012 11:00 am');
      expect(subject.get('startDateString')).toEqual('2/1/2012');
      expect(subject.get('startTimeString')).toEqual('11:00 AM');
    });
  });

  describe("rawEnd", function() {
    it("can be set with a moment", function() {
      var m = moment('02/01/2012 11:00 AM');
      subject.set('rawEnd', m);
      expect(subject.get('rawEnd')).toEqual(m);
    });

    it("can be set with a string", function() {
      var m = moment('02/01/2012 11:00 AM');
      subject.set('rawEnd', '02/01/2012 11:00 AM');
      expect(subject.get('rawEnd')).toEqual(m);
    });

    it("sets the endDateString and endDateTime", function() {
      subject.set('rawEnd', '02/01/2012 11:00 am');
      expect(subject.get('endDateString')).toEqual('2/1/2012');
      expect(subject.get('endTimeString')).toEqual('11:00 AM');
    });
  });

  describe("mapTimezoneOffset", function() {
    it("returns browser offset if the map center is not present", function() {
      spyOnProperties(subject, {center: null, timezoneOffset: -4});
      expect(subject.get("mapTimezoneOffset")).toEqual(-4);
    });

    it("returns map timezone", function() {
      spyOnProperties(subject, {
        center: [37.797464,-122.394772],
        timezoneOffset: -4,
        rawStart: moment([2012, 1, 1])
      });
      spyOn(IWitness.spaceTime, "utcOffset").andReturn(-420)
      expect(subject.get("mapTimezoneOffset")).toEqual(-7);
    });
  });

  describe("geo-location lookup", function() {
    beforeEach(function() {
      subject.setProperties({center: [1,2], zoom: 18});
    });

    it("sets map location to user's geolocation", function() {
      var responseData = {latitude: 4, longitude: 5};

      spyOn($, 'ajax').andCallFake(function(url, options) {
        options.success(responseData);
      });

      subject.setDefaultCenter();

      expect(subject.get('center')).toEqual([4,5]);
      expect(subject.get('zoom')).toEqual(9);
    });

    it("defaults to San Francisco when geo-lookup returns no data", function() {
      var responseData = {};

      spyOn($, 'ajax').andCallFake(function(url, options) {
        options.success(responseData);
      });

      subject.setDefaultCenter();

      expect(subject.get('center')).toEqual([37.75771992816863 ,-122.43760000000003]); // SF
      expect(subject.get('zoom')).toEqual(11);
    });

    it("defaults to San Francisco when geo-lookup fails", function() {
      var responseData = {};

      spyOn($, 'ajax').andCallFake(function(url, options) {
        options.fail(responseData);
      });

      subject.setDefaultCenter();

      expect(subject.get('center')).toEqual([37.75771992816863 ,-122.43760000000003]); // SF
      expect(subject.get('zoom')).toEqual(11);
    });
  });
});
