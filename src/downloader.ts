import youtubeDlExec, { YtResponse } from 'youtube-dl-exec';
import axios from 'axios'
import fs from 'fs'
import { promisify } from 'util';
import * as stream from 'stream';
import {quality} from './types'

const finished = promisify(stream.finished);

const baseLocation = "./video"

export const downloader = async (videoURL:string, baseURL: string, quality: quality) => {
    let lastIndex = videoURL.lastIndexOf('/')
    let videoName = videoURL.substring(lastIndex + 1)
    let folderLocation = baseLocation + "/" + baseURL

    fs.mkdirSync(folderLocation, {recursive: true})

    let videoFileName = folderLocation + "/" + videoName + ".mp4"
    let output = await youtubeDlExec(videoURL, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
            `referer:${baseURL}`,
            `cookie:${process.env.LES_MILLS_COOKIE}`
        ]
      
    })
    let qualityData = fetchFormatData(quality, output)
    if(!qualityData) return {success: false, error: 'Could not find any video data for any quality'}
    //console.log(`Obtaining video with name ${videoName}, with size: ${output.filesize}`)

    const writer = fs.createWriteStream(videoFileName);
    await axios({
        url: qualityData.url, //your url
        method: 'GET',
        responseType: 'stream', // important
    }).then(response => {
        response.data.pipe(writer);
        return finished(writer); //this is a Promise
    });

    return {success: true}
}

const formatId = (quality: quality) =>  "http-" + quality + "p"

const fetchFormatData = (quality: quality, output: YtResponse) => {
    const matchingFormatId = formatId(quality)
    const qualities:quality[] = [240, 360, 720, 1080]
    const currentIndex = qualities.indexOf(quality)
    let matchingOutput = output.formats.find(o => o.format_id == matchingFormatId)

    if(matchingOutput) return matchingOutput
    
    //Get next best quality
    let upper = qualities.slice(currentIndex + 1)
    let lower = (currentIndex == 0 ? [] : qualities.slice(0, currentIndex)).sort((a,b) => b - a)
    let remainingQualities = upper.concat(lower)
    //let remainingQualities = qualities.slice(currentIndex + 1)//qualities.splice(currentIndex, 1)

    //if(quality == 720 || quality == 1080) remainingQualities.sort((a,b) => b - a)
    //else remainingQualities.sort((a,b) => a - b)
    //Find next lower quality
    for(let i = 0; i < remainingQualities.length; i++) {
        let remQuality = remainingQualities[i]
        let getNextBest = output.formats.find(o => o.format_id == formatId(remQuality))
        if(getNextBest) {
            matchingOutput = getNextBest
            break
        }

    }
    
    if(matchingOutput) return matchingOutput

    return null

}