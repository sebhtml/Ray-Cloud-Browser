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

#ifndef _VertexObject_h

#include <stdint.h>
#include <iostream>
using namespace std;

/**
 * An object found in the database.
 */
class VertexObject{
	char m_sequence[256];
	uint32_t m_coverage;
	char m_parents[4];
	char m_children[4];
	
public:

	void setSequence(char*value);
	void setCoverage(uint32_t value);
	uint32_t getCoverage();
	void writeContentInJSON(ostream*stream);
	void addParent(char symbol);
	void addChild(char symbol);
	int getSymbolCode(char symbol);
	char getCodeSymbol(int code);
};

#endif
