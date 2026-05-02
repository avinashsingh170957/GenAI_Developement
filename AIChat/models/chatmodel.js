import Ollama from "ollama";
class chatmodels {

    async chatserver(msg) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await Ollama.chat({
                    model: "phi3:mini",
                    messages: [
                        {
                            role: "user",
                            content: msg
                        }
                    ]
                });
                resolve(response.message.content)
            } catch (error) {
                console.log(`error`, error);
                reject(error);
            }
        })
    }
}

export default new chatmodels();