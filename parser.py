import pdb
import mailbox
import sys
import re
import string
import bs4
import csv

# Convert an mbox file into a csv (printed to stdout)

def cleanhtml(raw_html):
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext

# build a table mapping all non-printable characters to None
NOPRINT_TRANS_TABLE = {
    i: ' ' for i in range(0, sys.maxunicode + 1) if not chr(i).isprintable()
}

if __name__ == "__main__":
    mb = mailbox.mbox('mbox/messages.mbox')
    writer = csv.writer(open('emails.csv', 'w', newline=''), delimiter=',')
    writer.writerow(['From', 'Subject', 'Date', 'Body'])
    for message in mb.itervalues():
        dmessage = dict(message.items())
        payload = []
        if (message.is_multipart()):
            payload = message.get_payload()
            payload = [p.get_payload(decode=True) for p in payload]
        else:
            payload = [message.get_payload(decode=True)]
        # payload should now be a decoded string array 
        from_header = dmessage['From']
        subject = dmessage['Subject']
        date = dmessage['Date']
        payload = [p.decode('utf8') for p in payload if p is not None]

        payload = ' '.join(payload)
        soup = bs4.BeautifulSoup(payload, 'html.parser')
        while soup.style is not None:
            soup.style.decompose()
        text = soup.get_text().translate(NOPRINT_TRANS_TABLE)
        # remove punc
        text = text.translate(str.maketrans('', '', string.punctuation))
        delchar = ''.join(c for c in map(chr, range(256)) if not c.isalnum())

        text = ' '.join([w.strip().lower().translate(str.maketrans('','',delchar)) for w in text.split(' ') if len(w.strip()) > 0])

        output = {
            'from': from_header,
            'subject': subject,
            'date': date,
            'body': text,
        }
        writer.writerow([output['from'], output['subject'], output['date'], output['body']])


