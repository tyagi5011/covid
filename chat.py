import random
import json
import requests
import torch
import os
from gtts import gTTS
import pyttsx3
# import speech_recognition as sr

from model import NeuralNet
from nltk_utils import bag_of_words, tokenize

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('pra.json', 'r', encoding='utf-8') as json_data:
    intents = json.load(json_data)

FILE = "data.pth"
data = torch.load(FILE)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

bot_name = "Sam"

#getting co-ordinates
get_lat_long_url="https://geocode.search.hereapi.com/v1/geocode"
api_key_lat_long='OiIg_3X4c9833s-eJqA45M18EFbJvQxuIvRoOZsTIjY'
#getting hospitals
get_hospitals_url="https://discover.search.hereapi.com/v1/discover"
api_key_hospitals='OiIg_3X4c9833s-eJqA45M18EFbJvQxuIvRoOZsTIjY'
#getting statistics
get_statistics_url="https://api.covid19india.org/data.json"

# sample_rate = 48000
# chunk_size = 2048 
# r = sr.Recognizer()
# r.pause_threshold = 0.3


def get_response(msg):
    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    print(prob.item(),tags[predicted.item()])
    if prob.item() > 0.75:
        for intent in intents["intents"]:
            print(intent["tag"])
            if tag == intent["tag"]:
                return random.choice(intent["responses"])
    
    return "I do not understand..."

def get_initial(msg):
    return ["Search nearby hospitals","Ask queries","Emergency Information","speech to text"]

def get_lat_lng(address):
  PARAMS = {
            'apikey':api_key_lat_long,
            'q':address,
            } 
# sending get request and saving the response as response object 
  r_loc = requests.get(url=get_lat_long_url,params=PARAMS) 
  data_loc = r_loc.json()
  print('State: ',data_loc['items'][0]['address']['state'])
  latitude=data_loc['items'][0]['position']['lat']
  longitude=data_loc['items'][0]['position']['lng']
  print('Your co-ordinates are :',latitude,longitude)
  return [latitude,longitude]

def get_hospitals_by_location(address,limit=4):
    lat,lng=get_lat_lng(address)
    query='hospitals'
    PARAMS_HOSP = {
            'apikey':api_key_hospitals,
            'q':query,
            'limit': limit,
            'at':'{},{}'.format(lat,lng)
         }
    r = requests.get(url = get_hospitals_url, params = PARAMS_HOSP) 
    data = r.json() 
    print('Nearby Hospitals are : ')
    answer={}
    for i in range(0,limit):
        answer[data['items'][i]['title']]=data['items'][i]['address']['label']
        print('address: ',data['items'][i]['address']['label'])
        print('\n')
    return answer

def speak_text(MyText):
    MyText = MyText.lower()
    engine = pyttsx3.init()
    rate = engine.getProperty('rate')
    engine.setProperty('rate', 175)   # getting details of current speaking rate
    print (rate)  
    engine.say(MyText)
    engine.runAndWait()
    engine.stop()



if __name__ == "__main__":
    print("Let's chat! (type 'quit' to exit)")
    print("Do you want to search nearby hospitals?")
    answer=input("You: ")
    if answer in ["yes","y","Yes"]:
        location=input("enter location")
        resp=get_hospitals_by_location(location)
        print(resp)
    else:
        mytext=input("convert text to speech")
        speak_text(mytext)
    while True:
        # sentence = "do you use credit cards?"
        sentence = input("You: ")
        if sentence == "quit":
            break

        resp = get_response(sentence)
        print(resp)

