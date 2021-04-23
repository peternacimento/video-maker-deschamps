const readline = require('readline-sync')
const state = require('./state.js')

function robot(){
    const content = {
        maximuSentence: 7
    }
    
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    
    function askAndReturnSearchTerm(){
        return readline.question('Type a wikipedia search term: ')
    }
    
    function askAndReturnPrefix(){
        const prefixes = ['Quem é', 'O que é', 'História da', 'História do']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose on option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]
    
        return selectedPrefixText
    }
}

module.exports = robot