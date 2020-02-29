(async function () {

    let element = document.createElement('h1');
    element.textContent = 'Spaceships list:';
    element.id = 'spaceships-list';
    document.getElementById('log').appendChild(element);


    async function fetchJSON(url) {
        return await fetch(url).then(res => { return res.json() });
    }

    function draw(ctx, points) {
        ctx.beginPath();
        ctx.moveTo(points[0].x * ctxScale, points[0].y * ctxScale);
        for (i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x * ctxScale, points[i].y * ctxScale);
        }
        ctx.closePath();
        ctx.stroke();
    }
    function area(points) {
        let area = 0;
        let j = points.length - 1;

        for (i = 0; i < points.length; i++) {
            area += (points[j].x + points[i].x) * (points[j].y - points[i].y);
            j = i;
        }
        return -area / 2;
    }

    const dirname = `${window.location.origin}/api/gamefiles`;

    const ctxScale = 20;

    const promises = (await fetchJSON(`${dirname}/config.json`)).spaceships.map(async (spaceshipName) => {
        const spaceship = { shape: [], name: spaceshipName, ...(await fetchJSON(`${dirname}/${spaceshipName}.json`)) };
        const turretName = spaceship.turrets[0].type;
        const turret = { name: turretName, ...(await fetchJSON(`${dirname}/${turretName}.json`)) };

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const width = (Math.max(...spaceship.points.map(p => p.x)) - Math.min(...spaceship.points.map(p => p.x))) * ctxScale + 30;
        const height = (Math.max(...spaceship.points.map(p => p.y)) - Math.min(...spaceship.points.map(p => p.y))) * ctxScale + 10;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        const scale = window.devicePixelRatio;
        canvas.width = width * scale;
        canvas.height = height * scale;

        ctx.scale(scale, scale);

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'bevel'
        ctx.translate(1, 5);

        const m = {
            x: Math.min(...spaceship.points.map(p => p.x)),
            y: Math.min(...spaceship.points.map(p => p.y))
        };
        draw(ctx, spaceship.points.map(p => { return { x: p.x - m.x, y: p.y - m.y } }));

        const c = {
            x: turret.points.reduce((a, b) => a + b.x, 0) / turret.points.length + m.x,
            y: turret.points.reduce((a, b) => a + b.y, 0) / turret.points.length + m.y
        };
        spaceship.turrets.forEach(t => draw(ctx, turret.points.map((p) => { return { x: p.x + t.x - c.x, y: p.y + t.y - c.y } })));

        spaceship.mass = Math.round(area(spaceship.points) * spaceship.density);
        spaceship.damagePerMinute = Math.round(spaceship.turrets.length * turret.damage * 60 * spaceship.reload.length / spaceship.reload.reduce((a, b) => a + b));
        spaceship.reload = spaceship.reload.reduce((a, b) => `${a} ${b}`, '');
        const duplicates = /\b(\d+\.?\d*)(\s+\1)+\b/g.exec(spaceship.reload);
        if (duplicates)
            spaceship.reload = spaceship.reload.replace(duplicates[0], `${duplicates[1]}x${(duplicates[0].match(new RegExp(duplicates[1], 'g')) || []).length}`);
        spaceship.numberOfTurrets = spaceship.turrets.length;

        delete spaceship.points;
        delete turret.points;
        delete turret.origin;
        delete turret.bulletShape;
        delete spaceship.turrets;
        if (spaceship.shields)
            spaceship.shields = 'yes';
        delete spaceship.name;
        delete spaceship.friction;
        delete spaceship.density;
        delete spaceship.linearDamping;
        delete spaceship.angularDamping;

        spaceship.turretType = turret;
        const element = document.createElement('div');
        element.innerHTML = `<div><h2>${spaceshipName}</h2>${tableify(spaceship)}</div>`;

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
                date: new Date(el.date).toLocaleDateString(undefined,
                    { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }
                )
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
