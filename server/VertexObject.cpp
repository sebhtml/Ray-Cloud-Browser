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

#include "VertexObject.h"
#include <string.h>

void VertexObject::setSequence(char*value){
	strcpy(m_sequence,value);
}

void VertexObject::setCoverage(uint32_t value){
	m_coverage=value;
}

uint32_t VertexObject::getCoverage(){
	return m_coverage;
}

void VertexObject::writeContentInJSON(ostream*stream){
	(*stream)<<"{"<<endl;
	(*stream)<<"	\"sequence\": \""<<m_sequence<<"\","<<endl;
	(*stream)<<"	\"coverage\": "<<m_coverage<<","<<endl;
	(*stream)<<"	\"parents\": [],"<<endl;
	(*stream)<<"	\"children\": []"<<endl;
	(*stream)<<"}"<<endl;
}

