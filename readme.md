# Les Mills On Demand Downloader

An easy way to download videos on les mills on demand. Makes playing videos offline much easier. Used for personal use only.

Todo List:
- Able to select what programs you want deleted
- concurrent downloads; able to choose how many downloads one given go
- select quality (480p, 720p, etc)
- change the cookie as a env file
- write readme
- select location of the downloads

How to use:

Modify the .env.sample file and rename it to .env.

Please change LES_MILLS_COOKIE variable and change COOKIE to the cookie you obtain in les mills when logged in.

To obtain different les mills videos change the LES_MILLS_VIDEO_URL to what you want to download. For example, if you want body attack videos you use 'https://watch.lesmillsondemand.com/bodyattack/season:1'

Run script with npm run dev and it should place all videos in video folder in this project folder.

