import * as dotenv  from "dotenv"
import { getProgramURLs, getVideoURLs } from "./scraper"
import { downloader } from "./downloader"
import fs from 'fs'
import { quality } from "./types"

dotenv.config()

const checkArrayIsWithType = (arr: any[], type: string) => {
    let checkIfType = true
    arr.forEach((val) => {
        if(typeof val != type) {
            checkIfType = false
        }
    })

    if(!checkIfType) throw new Error(`Failed to fetch all program urls. Not ${type} type`)

}

const runWithProgramURLs = async (quality:quality) => {
    const programURLs = await getProgramURLs() as string[]
    if(!programURLs || programURLs && !programURLs.length) throw new Error("Invalid program urls")
    checkArrayIsWithType(programURLs, "string")

    for(let i = 0; i < programURLs.length; i++) {
        const programURL = programURLs[i]
        await fetchVideosWithProgramURL(programURL, quality)

    }

}


const fetchVideosWithProgramURL = async (url:string, quality:quality) => {
    var stream = fs.createWriteStream("./videos.txt", {flags:'a'});

    const badVideos: any[] = []
    const endIndex = url.lastIndexOf('/')
    const urlBase = url.substring(url.indexOf('com/') + 4, endIndex)
    console.log(`Start getting video URLs for ${urlBase} using URL ${url}`)

    const videoURLs = await getVideoURLs(url) as string[]
    
    if(!videoURLs || videoURLs && !videoURLs.length) throw new Error("Invalid video urls")
    checkArrayIsWithType(videoURLs, "string")

    console.log(`Number of videos for ${urlBase} is: `, videoURLs.length)

    stream.write(`VIDEOS for ${urlBase}` + "\n");

    videoURLs.forEach( function (item,index) {
        stream.write(item + "\n");
    });


    //For each URL 
    for(let i = 0; i < videoURLs.length; i++) {
        let videoURL = videoURLs[i]
        console.log(`Start downloading ${videoURL}`)
        let response = await downloader(videoURL, urlBase, quality)

        if(!response.success) badVideos.push(videoURL)
    }

    return {success: badVideos.length ? false : true, badVideos: badVideos}
}


const run = async () => {
    let quality = Number(process.env.QUALITY) as quality
    let response = await fetchVideosWithProgramURL(process.env.LES_MILLS_VIDEO_URL ?? '', quality)
    console.log(response)
    //await downloader('https://watch.lesmillsondemand.com/bodyattack/season:1/videos/bodyattack-116-30-min', 'bodyattack', 720)
}

run()