require.env.config();
const jsforce = require("jsforce");

const conn = new jsforce.Connection({
	// you can change loginUrl to connect to sandbox or prerelease env.
	// loginUrl: "https://test.salesforce.com",
	// securityToken: "C8ZM7jcnHASRqW3P13w5MoCNw",
	/*   00D8d0000020VV2!ARoAQLg8nPq.W3.bdZ5Xi9wOitxZhpH98M0Gs4iZvQjAUos6NxtAHxpR9bGdlA9jYWeDR0Dz4rKCzLlicXkxa3aEhAK19uD6
https://techcom-5a-dev-ed.my.salesforce.com
User ID: 0058d000001113kAAA
Org ID: 00D8d0000020VV2EAM */
});
conn.login(
	process.env.username,
	process.env.password,
	function (err, userInfo) {
		if (err) {
			return console.error(err.message);
		}
		// Now you can get the access token and instance URL information.
		// Save them to establish connection next time.
		console.log(conn.accessToken);
		console.log(conn.instanceUrl);
		// logged in user property
		console.log("User ID: " + userInfo.id);
		console.log("Org ID: " + userInfo.organizationId);
		// ...
	}
);
// var records = [];
// conn.query("SELECT Id, Name FROM Account", function (err, result) {
// 	if (err) {
// 		return console.error(err);
// 	}
// 	console.log("total : " + result.totalSize);
// 	console.log("fetched : " + result.records.length);
// });
const sForceField = [
	"Album",
	"Artist",
	"Customer",
	"Employee",
	"Genre",
	"Invoice_item",
	"Invoice",
	"Media_type",
	"Playlist_track",
	"Playlist",
	"Track",
];

// Get employee records from salesforce
const records = [];
conn.query("SELECT * FROM Employee", function (err, result) {
	if (err) {
		return console.error(err);
	}
	records.push(result.records);
	console.log("total : " + result.totalSize);
	console.log("fetched : " + result.records.length);
});
// Writing files to CSV
// const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");

fs.createReadStream(path.resolve(__dirname, "assets", "employee.csv"))
	.pipe(csv.parse({ headers: true }))
	// pipe the parsed input into a csv formatter
	.pipe(csv.format({ headers: true }))
	// Using the transform function from the formatting stream
	.transform((row, next) => {
		records.findById(row.id, (err, user) => {
			if (err) {
				return next(err);
			}
			return next(null, {
				id: row.id,
				FirstName: row.FirstName,
				LastName: row.LastName,
				address: row.Address,
				// properties from user
				// isVerified: user.isVerified,
				// hasLoggedIn: user.hasLoggedIn,
				// age: user.age,
			});
		});
	})
	.pipe(process.stdout)
	.on("end", () => process.exit());
