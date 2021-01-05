var calculateScore = require('../src/controllers/helper/calculateScores.js')
var teamScore = require('../src/controllers/helper/calculateScores.js')
var expect = require('chai').expect

describe('#calculateScore()', function() {

    it('should create an object of scores', function  {
        expect(teamScore([{someStudentGoeshere}],["blue"],0,true)).to.equal({"blue":{name:"blue",players:1,correct:1}})
    })

})

let sampleData = {}