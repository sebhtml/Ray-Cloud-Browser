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

function Kmer(sequence,coverage,parents,children){
	this.sequence=sequence;
	this.coverage=coverage;
	this.parents=parents;
	this.children=children;
}

Kmer.prototype.getSequence=function(){
	return this.sequence;
}

Kmer.prototype.getCoverage=function(){
	return this.coverage;
}

Kmer.prototype.getParents=function(){
	return this.parents;
}

Kmer.prototype.getChildren=function(){
	return this.children;
}

