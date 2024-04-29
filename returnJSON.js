var obxCount = msg['OBX'].length();

var resultsWithLN = [];

for (var i = 0; i < obxCount; i++) {
    var identifier = msg['OBX'][i]['OBX.2']['OBX.2.1'].toString();
    if (identifier.indexOf("NM") > -1) {
        var testCode = msg['OBX'][i]['OBX.3']['OBX.3.1'].toString();
        var testDescription = msg['OBX'][i]['OBX.3']['OBX.3.2'].toString();
        var result = msg['OBX'][i]['OBX.5']['OBX.5.1'].toString();
        var units = msg['OBX'][i]['OBX.6']['OBX.6.1'].toString();
        var referenceRange = msg['OBX'][i]['OBX.7']['OBX.7.1'].toString();
        var abnormalFlags = msg['OBX'][i]['OBX.8']['OBX.8.1'].toString();

        var resultEntry = {
            "testCode": testCode,
            "testDescription": testDescription,
            "result": result,
            "units": units,
            "referenceRange": referenceRange,
            "abnormalFlags": abnormalFlags
        };
        resultsWithLN.push(resultEntry);

        logger.info("Found LN in OBX-" + i + ": " + JSON.stringify(resultEntry));
    }
}