const neo4j = require('neo4j-driver').v1;

// if (process.env.NODE_ENV === 'production') {
//     driver = neo4j.driver('bolt://hobby-igickikncggcgbkeepnhffbl.dbs.graphenedb.com:24786',
//     neo4j.auth.basic('admin', 'b.ZHHopQJodcm2.075zXwBCfsVgXwMq'));
//     console.log('Connected to graphendb cloud db')
// }
// else if ( process.env.NODE_ENV === 'testCloud' ) {
//     driver = neo4j.driver('bolt://hobby-igickikncggcgbkeepnhffbl.dbs.graphenedb.com:24786',
//     neo4j.auth.basic('admin', 'b.ZHHopQJodcm2.075zXwBCfsVgXwMq'));
//     console.log('Connected to graphendb cloud db')

// }else{
//     driver = neo4j.driver('bolt://localhost:7687',
//     neo4j.auth.basic('kevin', 'Test123'));
//     console.log('Connected to local graph db')
// }

var driver = neo4j.driver("bolt://hobby-fiaanogldadkgbkegdcepacl.dbs.graphenedb.com:24787", neo4j.auth.basic("admin", "b.g6qmbuyClW8f.In6F5mhjiVbm7hcU"));
console.log("Connected to Graphenedb")




module.exports = driver;