var m = new MersenneTwister(123);


function generateTerrainMap(mapDimension, unitSize, roughness, seed, ctx) {

	m = new MersenneTwister(seed);
	
	var map = create2DArray(mapDimension+1, mapDimension+1);
	startDisplacement(map, mapDimension);
	return map;

	// Setup the map array for use
	function create2DArray(d1, d2) {
		var x = new Array(d1),
		i = 0,
		j = 0;

		for (i = 0; i < d1; ++i) {
			x[i] = new Array(d2);
		}

		for (i=0; i < d1; ++i) {
			for (j = 0; j < d2; ++j) {
				x[i][j] = 0;
			}
		}

		return x;
	}

	// Starts off the map generation, seeds the first 4 corners
	function startDisplacement(map, mapDimension){
		var tr, tl, t, br, bl, b, r, l, center;

		// for (tl = 0; tl < mapDimension; ++tl) {
			// for (tr = 0; tr < 16; ++tr) {
				// map[tr][tl] 				= 0.1;
				// map[mapDimension-tr][tl]	= 0.1;
				// map[tl][tr]					= 0.1;
				// map[tl][mapDimension-tr]	= 0.1;
			// }
			// for (tr = 16; tr < 32; ++tr) {
				// map[tr][tl] 				= 0.5;
				// map[mapDimension-tr][tl]	= 0.5;
				// map[tl][tr]					= 0.5;
				// map[tl][mapDimension-tr]	= 0.5;
			// }
		// }

		// top left
		map[0][0] = m.random();// Math.random(1.0);
		tl = map[0][0];

		// bottom left
		map[0][mapDimension] = m.random();// Math.random(1.0);
		bl = map[0][mapDimension];

		// top right
		map[mapDimension][0] = m.random();// Math.random(1.0);
		tr = map[mapDimension][0];

		// bottom right
		map[mapDimension][mapDimension] = m.random();// Math.random(1.0);
		br = map[mapDimension][mapDimension];

		// Center
		
		map[mapDimension / 2][mapDimension / 2] = (tl + bl + tr + br) / 4;
		map[mapDimension / 2][mapDimension / 2] = normalize(map[mapDimension / 2][mapDimension / 2]);
//		map[mapDimension / 2][mapDimension / 2] = Math.random(1.0);
		center = map[mapDimension / 2][mapDimension / 2];

		/* Non wrapping terrain */
		/*
		map[mapDimension / 2][mapDimension] = bl + br + center / 3;
		map[mapDimension / 2][0] = tl + tr + center / 3;
		map[mapDimension][mapDimension / 2] = tr + br + center / 3;
		map[0][mapDimension / 2] = tl + bl + center / 3; */

		/*Wrapping terrain */
/*
		map[mapDimension / 2][mapDimension] = bl + br + center + center / 4;
		map[mapDimension / 2][0] = tl + tr + center + center / 4;
		map[mapDimension][mapDimension / 2] = tr + br + center + center / 4;
		map[0][mapDimension / 2] = tl + bl + center + center / 4;

*/
		// Call displacment
//		mapDimension /= 4;
		midpointDisplacment(mapDimension);
	}
	
	function midpointDisplacment(d) {
		var newDimension = d/2,
			step = newDimension/2;

		if (newDimension > unitSize) {
		
			for (var i = step; i < mapDimension; i += newDimension) {
				for (var j = step; j < mapDimension; j += newDimension) {
					diamondDisplacment(i, j, newDimension);
				}
			}
			
			midpointDisplacment(newDimension);
		}
	}

	/**
	 * x, y - center point coordinates
	 * dimension - square dimension
	*/
	function diamondDisplacment(x, y, dimension) {
		var newDimension = dimension / 2,
			left = x - newDimension,
			top = y - newDimension,
			right = x + newDimension,
			bottom = y + newDimension,

			topLeft = map[left][top],
			topRight = map[right][top],
			bottomLeft = map[left][bottom],
			bottomRight = map[right][bottom],
			
			spacer = 0,
			
			displacer = newDimension * 4;

		// Center
		map[x][y] = normalize((topLeft + topRight + bottomLeft + bottomRight) / 4 + displace(displacer));
		var center = map[x][y];
		
		// Top
		if (top > spacer) {
			if ((top - newDimension) > 0) {
				map[x][top] = (topLeft + topRight + center + map[x][top-newDimension]) / 4 + displace(displacer);
			} else {
				map[x][top] = (topLeft + topRight + center) / 3 + displace(displacer);
			}
			map[x][top] = normalize(map[x][top]);
		}
		
		// Bottom
		if (bottom < mapDimension - spacer) {
			if ((bottom + newDimension) < mapDimension) {
				map[x][bottom] = (bottomLeft + bottomRight + center + map[x][bottom+newDimension]) / 4 + displace(displacer);
			} else {
				map[x][bottom] = (bottomLeft + bottomRight + center) / 3 + displace(displacer);
			}
			map[x][bottom] = normalize(map[x][bottom]);
		}
		
		// Right
		if (right < mapDimension - spacer) {
			if ((right + newDimension) < mapDimension) {
				map[right][y] = (topRight + bottomRight + center + map[right + newDimension][y]) / 4 + displace(displacer);
			} else {
				map[right][y] = (topRight + bottomRight + center) / 3 + displace(displacer);
			}
			map[right][y] = normalize(map[right][y]);
		}

		// Left
		if (left > spacer) {
			if ((left - newDimension) > 0) {
				map[left][y] = (topLeft + bottomLeft + center + map[left - newDimension][y]) / 4 + displace(displacer);
			} else {
				map[left][y] = (topLeft + bottomLeft + center) / 3 + displace(displacer);
			}
			map[left][y] = normalize(map[left][y]);
		}
	}

	// Random function to offset the center
	function displace(num){
		var max = num / (mapDimension + mapDimension) * roughness;
		return (m.random()- 0.5) * max; 
	}

	// Normalize the value to make sure its within bounds
	function normalize(value){
		if( value > 1){
			value = 1;
		}else if(value < 0){
			value = 0;
		}
		return value;
	}
};