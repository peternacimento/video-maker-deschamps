const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../robots/credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content) {
    await fetchContentFromWikipedia(content)
    
    async function fetchContentFromWikipedia(content){

        var Algorithmia = require("algorithmia");

        var input = {
        "articleName": `${content.prefix} ${content.searchTerm}`,
        "lang": "pt"
        }
        
        Algorithmia.client(algorithmiaApiKey)
        .algo("web/WikipediaParser/0.1.2?timeout=300") // timeout is optional
        .pipe(input)
        .then(function(response) {
            content.souceContentOriginal = response.get().content
            sanitizeContent(content)
            
        })  
    }

    async function sanitizeContent(content){
        const withoutBlankLines = removeBlankLinesAndMarkdown(content.souceContentOriginal)
        const withoutDatesInParentheses = removeDataInParentheses(withoutBlankLines)

        content.sourceContentSanitized = withoutBlankLines
        //await breakContentIntoSentences(content)
        //console.log(withoutDatesInParentheses)
       
        async function removeBlankLinesAndMarkdown(text){
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().lenght === 0 || line.trim().startsWith('=')){
                    return false
                }

                return true
            })

            //return withoutBlankLinesAndMarkdown.join(' ')
            
            content.senteces = []

            const sentences = sentenceBoundaryDetection.sentences(withoutBlankLinesAndMarkdown.join(' '))
            sentences.forEach((sentences) => {
                content.senteces.push({
                    text: sentences,
                    keywords: [],
                    images:[]
                })
            })

            console.log(content)

        }

        async function removeDataInParentheses(text){
            return text
        }

    }
    
    async function breakContentIntoSentences(content){
        content.senteces = []

        const sentences = sentenceBoundaryDetection.sentences(`${content.sourceContentSanitized}`)
        sentences.forEach((sentences) => {
            content.senteces.push({
                text: sentences,
                keywords: [],
                images:[]
            })
        })
        
        //console.log(content)
    }
}

module.exports = robot