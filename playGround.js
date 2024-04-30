// This is A play Ground File. It is not used in production.
var dbConn = DatabaseConnectionFactory.createDatabaseConnection('org.postgresql.Driver', 'jdbc:postgresql://192.168.130.124:5433/lab', 'postgres', 'password');

dbConn.setAutoCommit(false);
var analyzerName = msg['MSH']['MSH.3']['MSH.3.1'].toString() + ' ' + msg['MSH']['MSH.4']['MSH.4.1'].toString();
var labId = msg['PV1']['PV1.1']['PV1.1.1'].toString();
var value = msg['OBX'][0]['OBX.1']['OBX.1.1'].toString();

try {
    var sql = "INSERT INTO mirths (name, lab_id, value,gender) VALUES (?, ?, ?,?)";

    var params = new java.util.ArrayList();
    params.add(analyzerName);
    params.add(labId);
    params.add(value);
    params.add("Male");

    dbConn.executeUpdate(sql, params);
    logger.info("Data inserted successfully.");

    dbConn.commit();
} catch (e) {
    logger.error("Error executing SQL query: " + e.message);
    try {
        dbConn.rollback();
    } catch (rollbackError) {
        logger.error("Error rolling back transaction: " + rollbackError.message);
    }
} finally {
    dbConn.setAutoCommit(true);
    if (dbConn) {
        dbConn.close();
    }
}