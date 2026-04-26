import {
    Client,
    CommandInteraction, ContextMenuCommandBuilder,
    Events,
    REST,
    Routes,
    SlashCommandBuilder,
} from "discord.js"
import {exec} from "child_process"

const blacklist = new Set([]);

const keymaps = {
    24:"q",
    25:"w",
    26:"e",
    27:"r",
    28:"t",
    29:"y",
    30:"u",
    31:"i",
    32:"o",
    33:"p",
    46:"l",
    45:"k",
    44:"j",
    43:"h",
    42:"g",
    41:"f",
    40:"d",
    39:"s",
    38:"a",
    52:"z",
    53:"x",
    // 54:"c",
    55:"v",
    56:"b",
    57:"n",
    58:"m",
}
function enable(enabled, name){
    console.log("enabled: "+enabled)

    let command = "wait ";
    for(const entry of Object.entries(keymaps)){
        command += `&& xmodmap -e "keycode ${entry[0]} = ${enabled ? 
            `${entry[1]} ${entry[1].toUpperCase()} ${entry[1]} ${entry[1].toUpperCase()}` : "NoSymbol"}" `;
    }

    exec(command);

    try {
        if (!enabled) exec(`notify-send -t 999999 "$(echo ${btoa(name)} | base64 -d) is loafing on you"`)
        else exec(`notify-send "$(echo ${btoa(name)} | base64 -d) has stepped off your keyboard"`)
    }catch(e){
        console.trace(e)
    }
}

//--

const client = new Client({ intents: [] })
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    client.on(Events.InteractionCreate, interaction=>{
        if(blacklist.has(interaction.user.id)) return;

        if(interaction.isCommand()
            && interaction instanceof CommandInteraction
        ){
            switch(interaction.commandName){
                case "loaf":
                    interaction.reply({
                        content:"loafing",
                        withResponse:true,
                        ephemeral: true,
                    });
                    enable(false, interaction.user.displayName);
                    break;
                case "unloaf":
                    interaction.reply({
                        content:"no more loaf",
                        withResponse:true,
                        ephemeral: true,
                    })
                    enable(true);
                    break;
            }
        }
    })
});

new REST().setToken(process.env.TOKEN).put(Routes.applicationCommands("1498004833234325595"), { body: [
        new SlashCommandBuilder().setName("loaf").setDescription(`loaf on ${process.env.USER_NAME}`).setContexts([0,1,2]).toJSON(),
        new SlashCommandBuilder().setName("unloaf").setDescription(`stop loafing on ${process.env.USER_NAME}`).setContexts([0,1,2]).toJSON(),
] });

client.login(process.env.TOKEN);

//--

const enableOnClose = ()=>{
    enable(true);
    process.exit();
}

// do something when app is closing
process.on('exit', ()=>enable(true));

// catches ctrl+c event
process.on('SIGINT', enableOnClose);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', enableOnClose);
process.on('SIGUSR2', enableOnClose);

// catches uncaught exceptions
process.on('uncaughtException', enableOnClose);