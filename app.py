from email import message
from flask import Flask, render_template, request, jsonify
from chat import get_response, get_initial, get_hospitals_by_location,get_hospitals_url,get_statistics_url,speak_text
import speech_recognition as sr
from bs4 import BeautifulSoup as BS
import requests

app=Flask(__name__)

@app.get("/")
def index_get():
    url= "https://www.worldometers.info/coronavirus/"
    data = requests.get(url)
    soup = BS(data.text, 'html.parser')
    total = soup.find("div", class_ = "maincounter-number").text
    total = total[1 : len(total) - 2]

    other = soup.find_all("span", class_ = "number-table")
    recovered = other[2].text
    deaths = other[3].text
    deaths = deaths[1:]
    ans ={'Total Cases' : total, 'Recovered Cases' : recovered, 
                                 'Total Deaths' : deaths}
    
    data2 = requests.get('https://api.rootnet.in/covid19-in/stats/latest').json()
    length = len(data2['data']['regional'])
    name={}
    for i in range(length):
        name[data2['data']['regional'][i]['loc']]=data2['data']['regional'][i]['confirmedCasesIndian']
    return render_template("base.html",variable1=ans['Total Cases'],variable2=ans['Recovered Cases'],variable3=ans['Total Deaths'],div_placeholder=name)

@app.get("/speechToText")
def speech_to_text():
    with sr.Microphone() as source:
        
        r = sr.Recognizer()
        #r.pause_threshold = 0.5
        r.energy_threshold=600
        #r.adjust_for_ambient_noise(source,duration=0.5)
        print("Say Something")
        audio = r.listen(source)          
        try:
            text = r.recognize_google(audio)
            print("you said: " + text)  
        except sr.UnknownValueError:
            text="Could not understand the audio"
            print("Google Speech Recognition could not understand audio")     
        except sr.RequestError as e:
            text="Server Error"
            print("Could not request results from Google Speech Recognition service; {0}".format(e))
    if text not in ["Could not understand the audio","Server Error"]:
        response=get_response(text)
    else:
        response="I do not understand!"
    message={"text":text, "response":response}
    return jsonify(message)

@app.post("/textToSpeech")
def text_to_speech():
    text=request.get_json().get("message")
    speak_text(text)
    message={"success": True}
    return jsonify(message)


@app.post("/initialOptions")
def initial():
    text=request.get_json().get("message")
    response = get_initial(text)
    message={"option1": response[0],"option2":response[1], "option3":response[2],"option4":response[3]}
    return jsonify(message)

@app.post("/hospitals")
def hospitals():
    address=request.get_json().get("message")
    response= get_hospitals_by_location(address)
    message={"answer":response}
    return jsonify(message)

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    response = get_response(text)
    message={"answer": response}
    return jsonify(message)

if __name__ == "__main__":
    app.run(debug=True)