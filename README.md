# SHRO Location Tracker
A NodeJS telegram bot solution for commanders to track the location of their men during Stay Home Restriction Order

Using Google Maps API, this bot will track and store the self reported locations men say they've been in any given day. Google Maps API allows for the commanders to randomly check and ensure that a cadet is home. 

To get started follow the video tutorial in Bot Demo Compressed.mp4

Step-By-Step Video Tutorial (below)
Illustrates how to:
1) Create a new unit (eg CSC) in a telegram group chat for commanders.
2) How users (eg CSC men) can add themselves into your created unit.
3) How each user can then make a request to leave their house.
4) How commanders can approve-deny the request through the admin chat. / Just FYI when they go out depending on the chosen mode
5) Lastly, how another unit can use their own telegram admin chat to create their unit in the database as well (aka multiple units can use this bot). Each created unit will have a unique hash key that can be sent to all personnel for them to be added in.