const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../robots/credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')
const watsonApiKey = require('../robots/credentials/watson-nlu.json').apikey
const watsonUrl = require('../robots/credentials/watson-nlu.json').url

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth')

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2020-08-01',
  authenticator: new IamAuthenticator({
    apikey: watsonApiKey,
  }),
  serviceUrl: watsonUrl,
})

async function robot(content) {
  await fetchContentFromWikipedia(content)
  
  //await fetchWatsonAndReturnKeywords('Lá, ele ganhou uma grande experiência prática em engenharia elétrica.')

  async function fetchContentFromWikipedia(content) {

    var Algorithmia = require("algorithmia");

    var input = {
      "articleName": `${content.prefix} ${content.searchTerm}`,
      "lang": "pt"
    }

    Algorithmia.client(algorithmiaApiKey)
      .algo("web/WikipediaParser/0.1.2?timeout=300") // timeout is optional
      .pipe(input)
      .then(function (response) {
        content.souceContentOriginal = response.get().content
        sanitizeContent(content)

      })
  }

  async function sanitizeContent(content) {
    const withoutBlankLines = removeBlankLinesAndMarkdown(content.souceContentOriginal)
    const withoutDatesInParentheses = removeDataInParentheses(withoutBlankLines)

    content.sourceContentSanitized = withoutBlankLines

    async function removeBlankLinesAndMarkdown(text) {
      const allLines = text.split('\n')

      const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().lenght === 0 || line.trim().startsWith('=')) {
          return false
        }

        return true
      })

      const texto =  withoutBlankLinesAndMarkdown.join(' ')
      await breakContentIntoSentences(withoutBlankLinesAndMarkdown.join(' '))
      await limitMaximumSentence(content)
      await fetchKeywordsOfAllSentences(content)
      console.log(content.senteces)
      
    }

    async function removeDataInParentheses(text) {
      return text
    }
  }

  async function breakContentIntoSentences(text) {
    content.senteces = []

    const sentences = sentenceBoundaryDetection.sentences(text)
    sentences.forEach((sentences) => {
      content.senteces.push({
        text: sentences,
        keywords: [],
        images: []
      })
    })
  }

  async function limitMaximumSentence(content){
    content.senteces = content.senteces.slice(0, content.maximuSentence)
  }

  async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      const analyzeParams = {
        'text': `${sentence}`,
        'language': 'pt',
        'features': {
          'keywords': {},
        },
      };
      
      naturalLanguageUnderstanding.analyze(analyzeParams)
        .then(analysisResults => {
                             
          resolve(analysisResults.result.keywords.map((keyword) =>{
            return keyword.text
          }))

          })
        .catch(err => {
          console.log('error:', err);
        });
    })
  }
  async function fetchKeywordsOfAllSentences(sentence) {
    for (const sentence of content.senteces) {
      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
    }
  }
}

module.exports = robot