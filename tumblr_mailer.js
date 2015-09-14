var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('x');

var client = tumblr.createClient({
  consumer_key: 'x',
  consumer_secret: 'x',
  token: 'x',
  token_secret: 'x'
});


var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf-8')

function csvParse(csvFile){
  var array = [];
  var lines = (csvFile.split("\n"));
  var header = lines[0].split(",");
  for (var i = 1; i < lines.length; i++) {
  	var info = lines[i].split(",");
  	var object = {};
  	for (var j = 0; j < header.length; j++) {
  		object[(header[j])] = info[j];
  		}
  	array.push(object);
  }
  return array;
}

var csv_data = csvParse(csvFile);

function lastWeek() {
	var date = new Date();
	date.setDate(date.getDate()-7);
	return Math.floor(date/1000);
}

var oneWeek = lastWeek();

client.posts('silviacodes.tumblr.com', function(err, blog){
	var latestPosts = [];
  var numPosts = blog.posts.length;
  for (var i = 0; i < numPosts; i++) {
  	if (oneWeek < blog["posts"][i]["timestamp"]) {
  		latestPosts.push(blog["posts"][i]["short_url"])
  	} 	
  }
  for (var i = 0; i < csv_data.length; i++) {
	var customizedTemplate = ejs.render(emailTemplate,
		{firstName: (csv_data[i]).firstName,
		numMonthsSinceContact: (csv_data[i]).numMonthsSinceContact,
		links: latestPosts
	})
	sendEmail("Silvia", "miszsilvia@gmail.com", "Silvia", "silviachen917@gmail.com", "Fullstack!", customizedTemplate)
}
})

  function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        console.log(message);
        console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }


		