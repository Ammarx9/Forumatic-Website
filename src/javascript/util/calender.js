import { getCollection } from './collection'
import { getDocIdData } from './document'

export async function getCurrentYearAndTerm(p_db){
    //get time frame collection
    const timeFrameColl = await getCollection(p_db, 'timeFrame')

    //get current year and term data from the "current" document
    const l_currentTimeFrameData = await getDocIdData(timeFrameColl, 'current')

    //prepare data
    const currentTime = new Date().getTime()
    const firstTermStart = new Date(l_currentTimeFrameData.firstTermStart).getTime()
    const firstTermEnd = new Date(l_currentTimeFrameData.firstTermEnd).getTime()
    const secondTermStart = new Date(l_currentTimeFrameData.secondTermStart).getTime()
    const secondTermEnd = new Date(l_currentTimeFrameData.secondTermEnd).getTime()
    const thirdTermStart = new Date(l_currentTimeFrameData.thirdTermStart).getTime()
    const thirdTermEnd = new Date(l_currentTimeFrameData.thirdTermEnd).getTime()

    if(currentTime < firstTermStart){//if current time is before first term

        const obj = {
            year: l_currentTimeFrameData.year,
            term: 1
        }
        return obj

    }else if(firstTermStart < currentTime && currentTime < firstTermEnd){//if current time in first term

        const obj = {
            year: l_currentTimeFrameData.year,
            term: 1
        }
        return obj

    }else if(firstTermEnd < currentTime && currentTime < secondTermStart){//if current time between first and second terms

        const obj = {
            year: l_currentTimeFrameData.year,
            term: 2
        }
        return obj

    }else if(secondTermStart < currentTime && currentTime < secondTermEnd){//if current time in second term

        const obj = {
            year: l_currentTimeFrameData.year,
            term: 2
        }
        return obj

    }else if(secondTermEnd < currentTime && currentTime < thirdTermStart){//if current time between second and third terms

        const obj = {
            year: l_currentTimeFrameData.year,
            term: 3
        }
        return obj

    }else if(thirdTermStart < currentTime && currentTime < thirdTermEnd){//if current time in term third

        const obj = {
            year: l_currentTimeFrameData.year,
            term: 3
        }
        return obj

    }

    console.error('The academic year has finished, can no longer determine year and term.\nReturning null.')
    return null
}

export function getDate(){
    const dataFactory = new Date()

    let year = dataFactory.getFullYear()
    let month = (dataFactory.getMonth() + 1)
    let day = dataFactory.getDate()

    if(month < 9){
        month = '0' + month
    }

    if(day < 9){
        day = '0' + day
    }

    const date = year + '-' + month + '-' + day

    return date
}