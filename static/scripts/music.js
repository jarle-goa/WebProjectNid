// Music //
async function listSongs(aid) {
    let reply = await fetch("/songs?aid=" + aid);
    if (reply.status==200){
        let result = await reply.json();
        let lyrics = document.getElementById("songs_div")
        lyrics.innerHTML = ""
        for (key in result){
            let p_lhead = newElement(lyrics,"h4");
            let p_lyric = newElement(lyrics,"p");
            p_lhead.innerText = result[key]["title"]
            p_lyric.innerHTML = result[key]["lyrics"]
        }
    }
}


