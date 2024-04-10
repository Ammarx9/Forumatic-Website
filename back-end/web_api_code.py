from flask import Flask, request, jsonify
import pyrebase
from docxtpl import DocxTemplate
import requests
import io
# to convor docx to pdf

# zip file libry
import zipfile
from flask_mail import Mail, Message

from flask_cors import CORS

# config = {
#     "apiKey": "AIzaSyBbXuWvBC74Cr2yjcqhy4fso0_mvexcNvI",
#     "authDomain": "tes-firebase-c4bd1.firebaseapp.com",
#     "projectId": "tes-firebase-c4bd1",
#     "storageBucket": "tes-firebase-c4bd1.appspot.com",
#     "messagingSenderId": "455374153486",
#     "appId": "1:455374153486:web:8636bca9c02b451457995f",
#     "measurementId": "G-7B1TY3X2FQ",
#     "databaseURL": ""
# }

config = {
 "apiKey": "AIzaSyDWghDWbfsGy4PpXbHNCmS6srRw8dVEWIA",
  "authDomain": "project---auto-ncaaa.firebaseapp.com",
  "databaseURL": "https://project---auto-ncaaa-default-rtdb.asia-southeast1.firebasedatabase.app",
  "projectId": "project---auto-ncaaa",
  "storageBucket": "project---auto-ncaaa.appspot.com",
  "messagingSenderId": "646412931799",
  "appId": "1:646412931799:web:38705b76096b8fb7731692",
  "measurementId": "G-47TNL98QQX"
}





app = Flask(__name__)

firebase = pyrebase.initialize_app(config)
storage = firebase.storage()

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'formatic911@gmail.com'
app.config['MAIL_PASSWORD'] = 'esiqnowhmdapclzc'
app.config['MAIL_DEFAULT_SENDER'] = 'formatic911@gmail.com'  # Set the default sender

mail = Mail(app)

CORS(app)


@app.route('/generate_document', methods=['POST'])
def generate_document():
    try:
        data_to_word = request.get_json()
        new_file_name = data_to_word["file_name"]

        file_path_firebase = "Course Report.docx"
        download_url = storage.child(file_path_firebase).get_url(None)

        # Download the Word document directly
        res = requests.get(download_url)
        is_file = io.BytesIO(res.content)

        # Create a DocxTemplate using the Word document
        doc = DocxTemplate(is_file)
        doc.render(data_to_word)

        # Save the rendered document to an in-memory file-like object
        output_content = io.BytesIO()
        doc.save(output_content)

        # Upload the in-memory file to Firebase Storage
        output_path =  new_file_name + ".docx"
        storage.child(output_path).put(output_content.getvalue())

        return jsonify({"message": "Document generated and saved successfully."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/zip_file', methods=['POST'])
def zip_file():
    try:
       json_data = request.get_json()
       coure_report_name = json_data["file_name"]
       zip_file_name = json_data["zip_file"]

       coure_report_path = coure_report_name+".docx"
       download_url = storage.child(coure_report_path).get_url(None)

        # Download the Word document directly
       res = requests.get(download_url)
       coure_report_sterm = io.BytesIO(res.content)


       zip_file_name_path = zip_file_name
       download_url = storage.child(zip_file_name_path).get_url(None)

        # Download the Word document directly
       res = requests.get(download_url)
       zip_file_name_strem = io.BytesIO(res.content)


# Create a zip file in memory
       zip_buffer = io.BytesIO()
       zip_file = zipfile.ZipFile(zip_buffer, 'a', zipfile.ZIP_DEFLATED, False)
       zip_file.writestr(coure_report_path, coure_report_sterm.getvalue())
       if (zip_file_name != "none"):
           zip_file_name_path = zip_file_name
           download_url = storage.child(zip_file_name_path).get_url(None)
           res = requests.get(download_url)
           zip_file_name_strem = io.BytesIO(res.content)
           zip_file.writestr(zip_file_name_path, zip_file_name_strem.getvalue())
           
       
       zip_file.close()  # Close the ZipFile manually

       zip_buffer.seek(0)

       zip_path =  coure_report_name + ".zip"
       storage.child(zip_path).put(zip_buffer.getvalue())

       return jsonify({"message": "Document generated and saved successfully."})






    except Exception as e :
     return jsonify({"error": str(e)}), 500
    
    

@app.route('/send_email', methods=['POST'])
def send_email():
    try:
       json_data = request.get_json()
       emails = json_data.get("emails",[])
       zip_file_name = json_data["file_name"]
       instuceter = json_data["dr"]

       file_path_firebase = zip_file_name+".zip"
       download_url = storage.child(file_path_firebase).get_url(None)

        # Download the Word document directly
       res = requests.get(download_url)
       file_stream = io.BytesIO(res.content)

       # Send the same email with attachment to multiple recipients
       for email in emails:
            msg = Message(subject="ncaa for "+instuceter, recipients=[email], body="all file is here")
            msg.attach(file_path_firebase, 'application/zip', file_stream.getvalue())
            mail.send(msg)



       return jsonify({"message": "Email sent successfully"}), 200


    except Exception as e :
        return jsonify({"error": str(e)}), 500


# you need to add this to check if this file is main 
if __name__  == "__main__":
    app.run(debug=True)
