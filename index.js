const readline = require('readline-sync')
const robots = {
    text: require('./robots/text.js')
}

async function start(){
    const content = {}

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    await robots.text(content)

    function askAndReturnSearchTerm(){
        return readline.question('Type a wikipedia search term: ')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Quem é', 'O que é', 'História da', 'História do']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose on option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]

        return selectedPrefixText
    }

    //console.log(content)
}

start()