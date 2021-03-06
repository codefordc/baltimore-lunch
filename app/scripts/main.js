/*jslint browser: true*/
/*global L, $ */

(function (window, document, $, L, undefined) {
    'use strict';

    L.Icon.Default.imagePath = 'images/';

    var GEOCODER = 'https://geodata.md.gov/imap/rest/services/GeocodeServices/MD_CompositeLocatorWithEsri/GeocodeServer';

    var map = L.map('map', {
        center: [39.3133, -76.6167],
        zoom: 12
    });

    new L.tileLayer('http://api.tiles.mapbox.com/v3/cmgiven.hpfpddp6/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 18,
        attribution: '<a href="https://www.mapbox.com">Mapbox</a>'
    }).addTo(map);

    var locations = L.layerGroup().addTo(map);
    var youAreHere = L.layerGroup().addTo(map);

    $(function () {
        $.when(
            $.ajax('data/locations.json')
        ).done(function (data) {
            locations.clearLayers();
            $.each(data, function () {
                L.marker([this._longitude, this._latitude], {
                }).addTo(locations)
                .bindPopup('<strong>' +
                    this._name + 
                    '</strong><br />' +
                    this._address);
            });
        });
    });

    $('#addressSearch').submit(function () {
        lookupAddress($(this).children('.address').val());
        return false;
    });

    var lookupAddress = function (string) {
        $.ajax({
            url: GEOCODER + '/findAddressCandidates',
            dataType: 'json',
            data: {
                f: 'json',
                singleLine: string,
                maxLocations: 1,
                outSR: 4326,
                searchExtent: '-8544518,4756605,-8510502,4779634'
            },
            success: function (response) {
                var point = response.candidates[0].location,
                    coords = L.latLng(point.y, point.x);

                map.panTo(coords);
                map.setZoom(15);

                youAreHere.clearLayers();
                L.circleMarker(coords, {
                    color: '#f03'
                }).addTo(youAreHere);

                var closestPoint;

                $.each(locations.getLayers(), function () {
                    this.options.distance = coords.distanceTo(this._latlng);

                    if (!closestPoint ||
                        this.options.distance < closestPoint.options.distance) {
                        closestPoint = this;
                    }
                });

                closestPoint.openPopup();
            }
        });
    };

}(window, document, $, L));