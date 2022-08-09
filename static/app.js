class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            microphone: document.querySelector('#microphone'),
            btn1:document.querySelector('#btn1'),
            btn2:document.querySelector('#btn2'),
            btn4:document.querySelector('#btn4')
        }

        this.state = false;
        this.messages = [];
        //this.messages.push({ name: "Sam", message:"<p>If you are experiencing a life-threatening emergency, please refer below:</p><div>National Emergency Number-112</div><div>Police-100</div><div>Fire-101</div><div>Ambulance-102</div>"})
        let first_message=''
        first_message+= '<p>Services provided are</p><button class="showButtons" id="btn1" onclick="myFunction1()"  >Search Nearby Hospitals</button>'
        first_message+= '<button class="showButtons" id="btn2" onclick="startChat()" >Ask Queries</button><button class="showButtons" id="btn3" onclick="getInfo()" >Emergency Information</button><button class="showButtons" id="btn4" onclick="listen()" >Speech To Text</button>'
        this.messages.push({ name: "Sam", message: first_message, val:"other"})
    }

    display() {
        const {openButton, chatBox, sendButton,microphone,btn1,btn2,btn3} = this.args;
        openButton.addEventListener('click', () => this.toggleState(chatBox))
        sendButton.addEventListener('click', () => this.onSendButton(chatBox))
        microphone.addEventListener('click', () => this.speechToText(chatBox))
        btn1.addEventListener('click',() => this.getHospitalsNearby(chatBox))
        btn2.addEventListener('click',() => this.start(chatBox))
        btn3.addEventListener('click',() => this.getStatistics(chatBox))
        btn4.addEventListener('click', () => this.speechToText(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }
    getHospitalsNearby(chatbox){
        var text1=prompt("Please enter your location")
        console.log(text1)
        if (text1 === ""&& text1==="null") {
            return;
        }
        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        fetch('http://127.0.0.1:5000/hospitals', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let info ={ name:"Sam",message:"you have selected: "+text1+" Hospitals are -", val:"other"}
            let msg2 = { name: "Sam", message: r.answer ,val:"hospitals" };
            console.log(r.answer)
            this.messages.push(info);
            this.messages.push(msg2)
            //this.updateHospitals(chatbox)
            this.updateChatText(chatbox)
            //textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            //textField.value = ''
          });
    }
    start(chatbox){
        let msg = { name: "Sam", message:" I would love to chat!!\n What's up?"};
        this.messages.push(msg)
        this.updateChatText(chatbox)
    }
    speechToText(chatbox){
        fetch('http://127.0.0.1:5000/speechToText', {
        method: 'GET',
        mode: 'cors',
        headers: {
        'Content-Type': 'application/json'
        },
         }).then(r => r.json())
        .then(r => {
        let info ={ name:"User",message:r.text, val:"other"}
        let resp={ name:"Sam",message:r.response}
        this.messages.push(info)
        this.messages.push(resp)
        this.updateChatText(chatbox)
        }).catch((error) => {
        //console.error('Error:', error);
        this.updateChatText(chatbox)
        });

    } 
    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if(this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }
    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }
        else if(text1==="options"){
            let m = { name: "User", message: text1 }
            this.messages.push(m);
            fetch('http://127.0.0.1:5000/initialOptions', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let options=[r.option1,r.option2,r.option3,r.option4]
            let html1=''
            html1+= '<p>Services provided are</p><button class="showButtons" onclick="myFunction1()"  >'+options[0]+'</button>'
            html1+= '<button class="showButtons" onclick="startChat()" >'+options[1]+'</button><button class="showButtons" onclick="getInfo()" >'+options[2]+'</button><button class="showButtons" onclick="listen()" >'+options[3]+'</button>'
            this.messages.push({ name: "Sam", message: html1, val:"other" })
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          })
        }
        else{
        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Sam", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
        }
    }
    updateChatText(chatbox) {
        console.log(chatbox)
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            let s=item.message
            if(item !== ""  && item !== null){
            if(Object.keys(item).length===3 && item['val']==="hospitals"){
                let keys=Object.keys(item['message'])
                let values=Object.values(item['message'])
                if (item.name === "Sam")
                {
                    html += '<div class="messages__item messages__item--visitor">'
                    for(let i=0;i<keys.length;i++){
                        html += '<div><span class="keys">' + keys[i] +':</span><div class="values">'+values[i]+ '</div></div>'
                    }
                    html+= '</div>'
                }
                else
                {
                    html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
                }
            }
            else if(Object.keys(item).length===3 && item['val']==="other"){
                if(item.name === "Sam"){
                html+='<div class="messages__item messages__item--visitor">' + item.message + '</div>'}
                else{html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'}
            }
            else{
                if (item.name === "Sam")
                {
                    html += '<div class="messages__item messages__item--visitor">' + item.message +`<button onclick='speak()' class="volume"><i class="fa fa-volume-up"></i></button></div>`
                }
                else
                {
                    html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
                }
        }
          }});


        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }    
}


const chatbox = new Chatbox();
chatbox.display();

function myFunction1(){
    let important=chatbox.args['chatBox']
    var text1=prompt("Please enter your location")
console.log(text1)
if (text1 === "" && text1==="null") {
    return;
}
let msg1 = { name: "User", message: text1 }
chatbox.messages.push(msg1);

fetch('http://127.0.0.1:5000/hospitals', {
    method: 'POST',
    body: JSON.stringify({ message: text1 }),
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(r => r.json())
  .then(r => {
    let info ={ name:"Sam",message:"you have selected: "+text1+"\n Hospitals are -", val:"other"}
    let msg2 = { name: "Sam", message: r.answer ,val:"hospitals" };
    console.log(r.answer)
    chatbox.messages.push(info);
    chatbox.messages.push(msg2)
    chatbox.updateChatText(important)
}).catch((error) => {
    console.error('Error:', error);
    chatbox.updateChatText(important)
  });
}
function startChat(){
    let important=chatbox.args['chatBox']
    let msg = { name: "Sam", message:" I would love to chat!!\n What's up?"};
    chatbox.messages.push(msg)
    chatbox.updateChatText(important)
}
function speak(){
    console.log(chatbox.messages.reverse())
    text=chatbox.messages[0].message
    console.log(text)
    let important=chatbox.args['chatBox']
    fetch('http://127.0.0.1:5000/textToSpeech', {
    method: 'POST',
    body: JSON.stringify({ message: text }),
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(r => r.json()
  ).catch((error) => {
    console.error('Error:', error);
  });

}
function listen(){
    let important=chatbox.args['chatBox']
    fetch('http://127.0.0.1:5000/speechToText', {
    method: 'GET',
    mode: 'cors',
    headers: {
    'Content-Type': 'application/json'
    },
     }).then(r => r.json())
    .then(r => {
    let info ={ name:"User",message:r.text, val:"other"}
    let resp={ name:"Sam",message:r.response}
    chatbox.messages.push(info)
    chatbox.messages.push(resp)
    chatbox.updateChatText(important)
    }).catch((error) => {
    //console.error('Error:', error);
    chatbox.updateChatText(important)
    });
} 
function getInfo()
{
    let important=chatbox.args['chatBox']
    chatbox.messages.push({ name: "Sam", message:"<p>If you are experiencing a life-threatening emergency, please refer below:</p><div>National Emergency Number-112</div><div>Police-100</div><div>Fire-101</div><div>Ambulance-102</div>"})
    chatbox.updateChatText(important)
}