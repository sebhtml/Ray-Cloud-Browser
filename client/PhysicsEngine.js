/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012  Sébastien Boisvert
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* yet another force-directed graph viewer */
/* the code is GPL */
/* author: Sébastien Boisvert */

function PhysicsEngine(screen){

	this.screen=screen;
	this.useGrid=false;
	this.range=10;

/* 
 * Coulomb's law
 * This is for the repulsion.
 */
	this.forceStep=0.05;
	this.charge=120;
	this.labelCharge=60;
	this.forceConstant=0.15;

/* 
 * Hooke's law 
 * This is for the springs, they keep everything together.
 * if it is too weak, the repulsion may win.
 */
	this.sprintStep=0.5;
	this.springConstant=0.35;
	this.springLength=20;

	/* velocity update */
	this.timeStep=1;
	this.damping=0.5;

	this.grid=new Grid(100);
}

/**
 * \see http://en.wikipedia.org/wiki/Force-based_algorithms_(graph_drawing)
 */
PhysicsEngine.prototype.applyForces=function(vertices){

	var i=0;

/*
 * Build an index.
 */
	var index=new Object();

	while(i<vertices.length){
		var vertex1=vertices[i];
		index[vertex1.getSequence()]=vertex1;
		i++;
	}

	i=0;
	while(i<vertices.length){
		var force=[0,0];

		var vertex1=vertices[i];
		i++;

		if(this.screen.isOutside(vertex1))
			continue;
/*
 * Actually, hits should be obtained with the grid.
 */
		var hits=new Array();

		var vertexRadius=vertex1.getRadius();
		var boxSize=this.range;

		if(this.useGrid){
			var keys=this.grid.getEntries(vertex1.getX(),vertex1.getY(),boxSize,boxSize);
			
			var keyNumber=0;
			while(keyNumber<keys.length){
				var keyValue=keys[keyNumber];
				keyNumber++;
				var vertex2=index[keyValue];
				hits.push(vertex2);
			}
		}else{
			hits=vertices;
		}

		//console.log("Hits= "+hits.length);

		var hitNumber=0;
		//console.log("Self= "+i);
		while(this.forceConstant!=0 && hitNumber<hits.length){

			//console.log("self= "+i+" hit= "+j);
			var vertex2=hits[hitNumber];

			hitNumber++;
/*
 * We don't want to compute forces against the same
 * object.
 */
			if(vertex1.getSequence()==vertex2.getSequence())
				continue;

			if(vertex1.isColored() && !vertex2.isColored())
				continue;
/*
			if(this.screen.isOutside(vertex2))
				continue;
*/
			var force2=this.getRepulsionForce(vertex1,vertex2);

			force=this.addForces(force,force2);
		}

		var arcs=vertex1.getLinkedObjects();

		for(j in arcs){

			var vertex2=arcs[j];

			var force2=this.getAttractionForce(vertex1,vertex2);

			force=this.addForces(force,force2);
		}

		vertex1.updateVelocity(this.timeStep*force[0],this.timeStep*force[1]);
	}

/*
 * Apply damping on every object.
 */
	var i=0;
	while(i<vertices.length){
		var vertex1=vertices[i];
		vertex1.applyDamping(this.damping);
		i++;
	}
}

/**
 * \see http://en.wikipedia.org/wiki/Hooke%27s_law
 */
PhysicsEngine.prototype.getAttractionForce=function(vertex1,vertex2){


	var dx=vertex2.getX()-vertex1.getX();
	var dy=vertex2.getY()-vertex1.getY();

	var distance=Math.sqrt(dx*dx+dy*dy);

	var displacement=distance-this.springLength;

	var force=this.springConstant*displacement;

	// get a unit vector 
	dx=dx/distance;
	dy=dy/distance;


	dx=dx*force;
	dy=dy*force;

	return [dx,dy];
}

/**
 * \see http://en.wikipedia.org/wiki/Coulomb's_law
 */
PhysicsEngine.prototype.getRepulsionForce=function(vertex1,vertex2){

	var dx=(vertex1.getX() - vertex2.getX());
	var dy=(vertex1.getY() - vertex2.getY());
	
	var length=Math.sqrt(dx*dx+dy*dy);

	dx=dx/length;
	dy=dy/length;

	var charge1=this.charge;
	var charge2=this.charge;

/*
 * Annotation are less charged with energy.
 */
	if(!vertex1.isColored() || !vertex2.isColored()){
		charge1=this.labelCharge;
		charge2=this.labelCharge;
	}

	var force=(this.forceConstant*charge1*charge2)/(length*length);

	dx=dx*force;
	dy=dy*force;

	return [dx,dy];
}



PhysicsEngine.prototype.addForces=function(force,force2){
	return [force[0]+force2[0], force[1]+force2[1]]
}

PhysicsEngine.prototype.moveObjects=function(vertices){
	// move objects

	var i=0;
	while(i<vertices.length){
		var vertex=vertices[i];
		
		vertex.update(this.timeStep,true);

		var boxSize=this.range;

		if(this.useGrid){
			var objectKey=vertex.getSequence();
			this.grid.removeEntry(objectKey);

			//console.log("vertices "+this.vertices.length+" i= "+i+" name= "+vertex.getName());
			this.grid.addEntry(objectKey,vertex.getX(),vertex.getY(),boxSize,boxSize);
		}

		i++;
	}
}


