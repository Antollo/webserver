(async function () {

    let element = document.createElement('h1');
    element.textContent = 'Spaceships list:';
    element.id = 'spaceships-list';
    document.getElementById('log').appendChild(element);


    async function fetchJSON(url) {
        return await fetch(url).then(res => { return res.json() });
    }

    const dirname = `${window.location.origin}/api/gamefiles`;

    const promises = (await fetchJSON(`${dirname}/config.json`)).spaceships.map(async (spaceshipName) => {
        const spaceship = { shape: [], name: spaceshipName, ...(await fetchJSON(`${dirname}/${spaceshipName}.json`)) };
        const turretName = spaceship.turrets[0].type;
        const turret = { name: turretName, ...(await fetchJSON(`${dirname}/${turretName}.json`)) };

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const width = 250;
        const height = 100;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        const scale = window.devicePixelRatio;
        canvas.width = width * scale;
        canvas.height = height * scale;

        ctx.scale(scale, scale);

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'bevel'
        ctx.translate(6, 30)
        ctx.beginPath();
        const m = 20;
        ctx.moveTo(spaceship.points[0].x * m, spaceship.points[0].y * m);
        for (i = 1; i < spaceship.points.length; i++) {
            ctx.lineTo(spaceship.points[i].x * m, spaceship.points[i].y * m);
        }
        ctx.closePath();
        ctx.stroke();

        spaceship.damagePerMinute = Math.round(spaceship.turrets.length * turret.damage * 60 / spaceship.reload);
        spaceship.numberOfTurrets = spaceship.turrets.length;
        delete spaceship.points;
        delete turret.points;
        delete turret.origin;
        delete turret.bulletShape;
        delete spaceship.turrets;

        spaceship.turretType = turret;
        const element = document.createElement('div');
        element.innerHTML = `<div><h2>${spaceship.name}</h2>${tableify(spaceship)}</div>`;

        element.querySelector('td table').parentElement.appendChild(canvas);
        document.getElementById('log').appendChild(element)
    });

    await Promise.all(promises);

    element = document.createElement('h1');
    element.textContent = 'Ranking:';
    element.id = 'ranking';
    document.getElementById('log').appendChild(element);

    const rankingElement = document.createElement('div');
    async function refresh() {
        let ranking = await fetchJSON('/api/results');
        ranking = ranking.map(el => {
            const date = new Date(null);
            date.setSeconds(el.time);
            return {
                time: date.toISOString().substr(11, 8),
                pilotName: el.pilotName,
                shipType: el.shipType,
                date: el.date
            }
        });
        rankingElement.innerHTML = tableify(ranking);
    }
    refresh()
    setInterval(refresh, 10000);
    document.getElementById('log').appendChild(rankingElement);

    element = document.createElement('h1');
    element.textContent = 'Help:';
    element.id = 'help';
    document.getElementById('log').appendChild(element);

    element = document.createElement('div');
    element.textContent = `Click 'Play game' in launcher to start the game.
        Type 'create T-4A yourName' (where T-4A is spaceship name and yourName is pilot's name) and hit enter.
        Then type 'create-bots' and attack them! Control the ship with W, A and D, aim with right mouse button
        and fire with left mouse button! Use 'help' command to learn more (e.g. how to list all spaceships names).
        Download link and more information are available here: `;
    element.id = 'ranking';
    document.getElementById('log').appendChild(element);

    element = document.createElement('a');
    element.textContent = 'github.com/Antollo/Starship-battle';
    element.href = 'https://github.com/Antollo/Starship-battle';
    element.style = 'text-decoration-line: underline;';
    document.getElementById('log').appendChild(element);

})();