import string
import datetime
import re
import json
import csv
import pdb
import nltk
from nltk.corpus import stopwords
stopwords_nltk = stopwords.words('english')
addl_sw = [
    'rj3503106@gmailcom',
    'rj3503106gmailcom',
    'sylvan',
    'robert',
]

if __name__ == "__main__":
    reader = csv.DictReader(open('emails.csv', 'rt'))
    all_candidates = ['warren', 'biden', 'pete', 'sanders', 'trump', 'amy', 'yang']
    messages = { c : [] for c in all_candidates }
    for row in reader:
        # 1: figure out who the sender is
        fromAddr = row['From'].lower()
        candidates = [ candidate for candidate in all_candidates if candidate in fromAddr ]
        if (len(candidates) == 0):
            candidates = ['Unknown']
            # ignore these, there are only 26
        if (row['Body'] is None):
            pdb.set_trace()

        candidate = candidates[0]
        date_str = row['Date'][0:16].strip()
        date_obj = datetime.datetime.strptime(date_str,'%a, %d %b %Y')
        message = {
            'candidate': candidate,
            'date': str(date_obj.date()),
            'body_words': { w: row['Body'].split(' ').count(w) for w in row['Body'].split(' ') if len(w) < 50 and w not in addl_sw and w not in stopwords_nltk}
        }
        if (candidate != 'Unknown'):
            messages[candidate].append(message)

    with open('all_emails.json', 'w') as out:
        json.dump(messages, out)

                
            


        

