var obxCount = msg['OBX'].length();
var dbConn = DatabaseConnectionFactory.createDatabaseConnection('org.postgresql.Driver', 'jdbc:postgresql://192.168.130.124:5433/lab', 'postgres', 'password');
dbConn.setAutoCommit(false);

try {
    var labId = msg['PV1']['PV1.1']['PV1.1.1'].toString();
    var analyzerName = msg['MSH']['MSH.3']['MSH.3.1'].toString() + ' ' + msg['MSH']['MSH.4']['MSH.4.1'].toString();

    for (var i = 0; i < obxCount; i++) {
        var identifier = msg['OBX'][i]['OBX.2']['OBX.2.1'].toString();
        if (identifier.indexOf("NM") > -1) {
            var testCode = msg['OBX'][i]['OBX.3']['OBX.3.2'].toString();
            if (testCode.includes("%")) {
                testCode = testCode.replace("%", "");
            }
            var result = parseFloat(msg['OBX'][i]['OBX.5']['OBX.5.1'].toString());
            var units = msg['OBX'][i]['OBX.6']['OBX.6.1'].toString();
            var referenceRange = msg['OBX'][i]['OBX.7']['OBX.7.1'].toString();
            var abnormalFlags = "N";

            if (referenceRange) {
                var referenceRangeArray = referenceRange.split("-");
                var lowerBound = parseFloat(referenceRangeArray[0]);
                var upperBound = parseFloat(referenceRangeArray[1]);

                if (result < lowerBound) {
                    abnormalFlags = "L";
                } else if (result > upperBound) {
                    abnormalFlags = "H";
                }
            }

            var sqlSelect = "SELECT ptd.id, ptd.test, ptd.lab_id, t.abbreviation, t.id AS test_id, ptd.finding, " +
                "pt.test_progress_status, pt.analyzer_result, pt.analyzer_id, ptd.analyzerresult, ptd.transfer_date_time " +
                "FROM patient_test_details ptd " +
                "LEFT JOIN tests t ON t.id = ptd.test_id " +
                "LEFT JOIN patient_tests pt ON pt.id = ptd.patient_test_id " +
                "WHERE t.abbreviation IS NOT NULL AND ptd.lab_id = '" + labId + "' " +
                "AND t.abbreviation = '" + testCode + "'";

            var rs = dbConn.executeCachedQuery(sqlSelect);
            while (rs.next()) {
                logger.info("YOUR ABBR IS : " + rs.getString("abbreviation"));
                var sqlUpdate = "UPDATE patient_test_details SET finding = ?,analyzerresult = ?,analyzer_name = ? WHERE id = ? AND lab_id = ?";
                var updateParams = new java.util.ArrayList();
                updateParams.add(result);
                updateParams.add(true);
                updateParams.add(analyzerName);
                updateParams.add(parseInt(rs.getString("id")));
                updateParams.add(labId);
                logger.info("Patient Test Detail Updated With Result : " + result);
                dbConn.executeUpdate(sqlUpdate, updateParams);
            }
        }
    }

    dbConn.commit();
} catch (e) {
    logger.error("Error executing SQL query: " + e.message);
    dbConn.rollback();
} finally {
    dbConn.setAutoCommit(true);
    dbConn.close();
}