cd mbox;
getmail --getmaildir .
cd ..
python3 parser.py
python3 stage3.py
python3 stage4.py
git add .
git commit -m 'update'
git push
