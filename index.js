'use strict';

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var request = require('request');

require('dotenv').config()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var botkit = require('botkit');

var facebookController = botkit.facebookbot({
  verify_token: process.env.fb_verify_token,
  access_token: process.env.fb_access_token,
  debug: false,
  stats_optout: true
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

facebookController.startTicking();

var facebookBot = facebookController.spawn({});

facebookController.setupWebserver(process.env.server_port,function(err,webserver) {
  facebookController.createWebhookEndpoints(facebookController.webserver, facebookBot, function() {
    console.log('Your facebook bot is connected.');
  });
});

facebookController.hears(['.*'], 'message_received', function(bot, message) {
    message.text = message.text.replace(/(\r\n|\n|\r)/gm," ");
    console.log('message_received -> ' + JSON.stringify(message));
    getSenderName(message.sender.id, function(senderName) {
        if (senderName === null) {
            senderName = 'bạn';
        }
        var attachment = {
            'type':'template',
            'payload':{
                'template_type':'generic',
                'elements':[
                    {
                        'title':'Freelancer IT Job!',
                        'image_url':'https://mm.aiircdn.com/38/595fade423e0b.png',
                        'subtitle':'Chào mừng ' + senderName + ' đến với Freelancer IT Job! Chúng tôi là nhà cung cấp nhân sự IT hàng đầu ở Việt Nam. Bạn muốn tìm nhân sự cho lĩnh vực: ',
                        'buttons':[
                            {
                                'type':'postback',
                                'title':'Software Engineer',
                                'payload':'Software Engineer'
                            },
                            {
                                'type':'postback',
                                'title':'IT Networking',
                                'payload':'IT Networking'
                            }
                        ]
                    }
                ]
            }
        };
        bot.reply(message, {
            attachment: attachment,
        });
    });

});

facebookController.hears(['IT Networking'], 'message_received,facebook_postback', function(bot, message) {
    var attachment = {
        'type':'template',
        'payload':{
            'template_type':'generic',
            'elements':[
                {
                    'title':'Freelancer IT Job!',
                    'image_url':'https://mm.aiircdn.com/38/595fade423e0b.png',
                    'subtitle':'Bạn muốn tìm nhân viên có kinh nghiêm trong lĩnh vực: ',
                    'buttons':[
                        {
                            'type':'postback',
                            'title':'IT Help Desk',
                            'payload':'IT Help Desk'
                        },
                        {
                            'type':'postback',
                            'title':'DevOps',
                            'payload':'DevOps'
                        }
                    ]
                }
            ]
        }
    };
    bot.reply(message, {
        attachment: attachment,
    });
});

facebookController.hears(['IT Help Desk','Helpdesk','Help Desk'], 'message_received,facebook_postback', function(bot, message) {
    var msgReply = 'Chúng tôi có hơn 1500 nhân sự có kinh nghiệm trong linh vực helpdesk. Vui lòng để lại thông tin liên hệ để được tư vấn tốt nhất. Cảm ơn quý khách hàng!';
    bot.reply(message, msgReply);
});

facebookController.hears(['DevOps', 'devops'], 'message_received,facebook_postback', function(bot, message) {
    var msgReply = 'Chúng tôi có hơn 100 kỹ sư có kinh nghiệm trong linh vực DevOps. Vui lòng để lại thông tin liên hệ để được tư vấn tốt nhất. Cảm ơn quý khách hàng!';
    bot.reply(message, msgReply);
});

facebookController.hears(['Software Engineer'], 'message_received,facebook_postback', function(bot, message) {
    var attachment = {
        'type':'template',
        'payload':{
            'template_type':'generic',
            'elements':[
                {
                    'title':'Freelancer IT Job!',
                    'image_url':'https://mm.aiircdn.com/38/595fade423e0b.png',
                    'subtitle':'Bạn muốn tìm lập trình viên thành thạo về ngôn ngữ: ',
                    'buttons':[
                        {
                            'type':'postback',
                            'title':'Java',
                            'payload':'Java'
                        },
                        {
                            'type':'postback',
                            'title':'PHP',
                            'payload':'PHP'
                        },
                        {
                            'type':'postback',
                            'title':'NodeJS',
                            'payload':'NodeJS'
                        }
                    ]
                }
            ]
        }
    };
    bot.reply(message, {
        attachment: attachment,
    });
});

facebookController.hears(['Java','java'], 'message_received,facebook_postback', function(bot, message) {
    var msgReply = 'Chúng tôi có hơn 1000 lập trình viên Java nhiều kinh nghiệm cho các dự án Mỹ, Úc, Pháp, Canada,...Vui lòng để lại thông tin liên hệ để được tư vấn tốt nhất. Cảm ơn quý khách hàng!';
    bot.reply(message, msgReply);
});

facebookController.hears(['PHP','php'], 'message_received,facebook_postback', function(bot, message) {
    var msgReply = 'Chúng tôi có hơn 550 lập trình viên PHP nhiều kinh nghiệm cho các dự án Mỹ, Nhật, Pháp,...Vui lòng để lại thông tin liên hệ để được tư vấn tốt nhất. Cảm ơn quý khách hàng!';
    bot.reply(message, msgReply);
});

facebookController.hears(['NodeJS','nodejs','NodeJs'], 'message_received,facebook_postback', function(bot, message) {
    var msgReply = 'Chúng tôi có hơn 260 lập trình viên NodeJS nhiều kinh nghiệm cho các dự án ở thị trường Châu Âu,...Vui lòng để lại thông tin liên hệ để được tư vấn tốt nhất. Cảm ơn quý khách hàng!';
    bot.reply(message, msgReply);
});

function getSenderName(senderId, callback) {
    request.get({
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          url: "https://graph.facebook.com/v2.6/" + senderId + "?fields=email,name&access_token=" + process.env.fb_access_token,
    }, function(err, response, body) {
          if (err) {
            logger.error(err);
            callback (null);
        } else {
            console.log(response);
            console.log(body);
            callback(JSON.parse(body).name);
        }
    });
}
