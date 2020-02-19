import string
import json
import csv
import pdb

if __name__ == "__main__":
    reader = csv.DictReader(open('emails.csv', 'rt'))
    messages = [];
    for row in reader:
        # 1: figure out who the sender is
        fromAddr = row['From'].lower()
        candidates = ['warren', 'biden', 'pete', 'sanders', 'trump', 'amy', 'yang']
        candidate = [ candidate for candidate in candidates if candidate in fromAddr ]
        if (len(candidate) == 0):
            candidate = 'Unknown'
            # ignore these, there are only 26
        if (row['Body'] is None):
            pdb.set_trace()
        message = {
            'candidate': candidate,
            'date': row['Date'],
            'body_words': { w: row['Body'].split(' ').count(w) for w in row['Body'].split(' ') if len(w) < 50}
        }
        if (candidate != 'Unknown'):
            messages.append(message)

    with open('emails.json', 'w') as out:
        json.dump(messages, out)

        

