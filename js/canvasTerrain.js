var m = new MersenneTwister(123);


function generateTerrainMap(mapDimension, unitSize, roughness, seed) {

	m = new MersenneTwister(seed);
	
	var map = create2DArray(mapDimension+1, mapDimension+1);
	startDisplacement(map, mapDimension);
	return map;

	// Setup the map array for use
	function create2DArray(d1, d2) {
		var x = new Array(d1),
		i = 0,
		j = 0;

		for (i = 0; i < d1; i += 1) {
			x[i] = new Array(d2);
		}

		for (i=0; i < d1; i += 1) {
			for (j = 0; j < d2; j += 1) {
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

	// Workhorse of the terrain generation.
	function midpointDisplacment(dimension){
		var newDimension = dimension / 2,
			spacer = 10,
			limit = spacer,
			top, topRight, topLeft, bottom, bottomLeft, bottomRight, right, left, center,
			i, j;

		if (newDimension > unitSize) {
			for(i = newDimension; i <= mapDimension; i += newDimension){
				for(j = newDimension; j <= mapDimension; j += newDimension){
					x = i - (newDimension / 2);
					y = j - (newDimension / 2);

					topLeft = map[i - newDimension][j - newDimension];
					topRight = map[i][j - newDimension];
					bottomLeft = map[i - newDimension][j];
					bottomRight = map[i][j];

					// Center
					map[x][y] = normalize((topLeft + topRight + bottomLeft + bottomRight) / 4 + displace(dimension));
//					map[x][y] = normalize(map[x][y]);
					center = map[x][y];
					
					if (!(x > limit && x < mapDimension-limit)) continue;
					if (!(y > limit && y < mapDimension-limit)) continue;

					// Top
					if ((j - newDimension) > spacer) {
						if(j - dimension + (newDimension / 2) > 0){
							map[x][j - newDimension] = (topLeft + topRight + center + map[x][j - dimension + (newDimension / 2)]) / 4 + displace(dimension);;
						}else{
							map[x][j - newDimension] = (topLeft + topRight + center) / 3 + displace(dimension);
						}

						map[x][j - newDimension] = normalize(map[x][j - newDimension]);
					}

					// Bottom
					if (j < mapDimension - spacer) {
						if(j + (newDimension / 2) < mapDimension){
							map[x][j] = (bottomLeft + bottomRight + center + map[x][j + (newDimension / 2)]) / 4+ displace(dimension);
						}else{
							map[x][j] = (bottomLeft + bottomRight + center) / 3+ displace(dimension);
						}

						map[x][j] = normalize(map[x][j]);
					}


					//Right
					if (i < mapDimension - spacer) {
						if(i + (newDimension / 2) < mapDimension){
							map[i][y] = (topRight + bottomRight + center + map[i + (newDimension / 2)][y]) / 4+ displace(dimension);
						}else{
							map[i][y] = (topRight + bottomRight + center) / 3+ displace(dimension);
						}

						map[i][y] = normalize(map[i][y]);
					}

					// Left
					if ((i - newDimension) > spacer) {
						if(i - dimension + (newDimension / 2) > 0){
							map[i - newDimension][y] = (topLeft + bottomLeft + center + map[i - dimension + (newDimension / 2)][y]) / 4 + displace(dimension);;
						}else{
							map[i - newDimension][y] = (topLeft + bottomLeft + center) / 3+ displace(dimension);
						}

						map[i - newDimension][y] = normalize(map[i - newDimension][y]);
					}
				}
			}
			midpointDisplacment(newDimension);
		}
	}

	// Random function to offset the center
	function displace(num){
		var max = num / (mapDimension + mapDimension) * roughness;
//		return (Math.random(1.0)- 0.5) * max;
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