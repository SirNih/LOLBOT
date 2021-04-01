let { spawn } = require('child_process')
let path = require('path')
let fs = require('fs')
const CFonts = require('cfonts')

CFonts.say('LOLHUMAN', {
    font: 'chrome',
    align: 'center',
    gradient: ['red', 'magenta']
})

CFonts.say('Biasalah...', {
    font: 'chrome',
    align: 'center',
    gradient: ['red', 'magenta']
})

require('./script.js')
nocache('./script.js', module => console.log(`'${module}' Updated!`))

/**
 * Uncache if there is file change
 * @param {string} module Module name or path
 * @param {function} cb <optional> 
 */
function nocache(module, cb = () => { }) {
    console.log('Module', `'${module}'`, 'is now being watched for changes')
    fs.watchFile(require.resolve(module), async () => {
        await uncache(require.resolve(module))
        cb(module)
    })
}

/**
 * Uncache a module
 * @param {string} module Module name or path
 */
function uncache(module = '.') {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(module)]
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

function start(file) {
    let args = [path.join(file), ...process.argv.slice(2)]
    let p = spawn(process.argv[0], args, {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc']
        })
        .on('message', data => {
            console.log('[RECEIVED]', data)
            switch (data) {
                case 'reset':
                    p.kill()
                    start.apply(this, arguments)
                    break
                case 'uptime':
                    p.send(process.uptime())
                    break
            }
        })
        .on('error', e => {
            console.error(e)
            fs.watchFile(args[0], () => {
                start()
                fs.unwatchFile(args[0])
            })
        })
}
start('script.js')