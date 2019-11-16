import asyncio
import random, time, sys, base64, json
import discord
import aiohttp
import io
from urllib.request import urlopen
from urllib.parse import urlparse
from io import BytesIO

from PIL import Image
from discord import Webhook, AsyncWebhookAdapter

with open("config.json") as json_file:
    config = json.load(json_file)
    TOKEN = config['token']
    CHANNEL = config['channelID']
    webhook_url = config['webhook']



client = discord.Client()

@client.event
async def on_message(message):
        # we do not want the bot to reply to itself
    if message.author == client.user:
        return
    if message.author.bot == True: return
    #elif message.content.startswith('-mverify'):
    elif str(message.channel.id) == CHANNEL:

        author = message.author
        roles = author.roles
        content = message.content
        await message.delete()
        for i in roles:
            if i.colour == discord.Color.blue():
                ignname = i.name
        command = "/cc "+ignname+": "+content
        sys.stdout.buffer.write(base64.b64encode(command.encode()))
        sys.stdout.flush()
        avatar = "https://mc-heads.net/avatar/"+str(ignname)
        url = urlparse(avatar)
        async with aiohttp.ClientSession() as session:
            webhook = Webhook.from_url(webhook_url, adapter=AsyncWebhookAdapter(session))
            await webhook.send(content, username=ignname, avatar_url=url.geturl())


client.run(TOKEN)
