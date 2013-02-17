/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Sébastien Boisvert
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

#include "constants.h"

#include <stdint.h>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

/**
 * An object found in the database.
 * \author Sébastien Boisvert
 */
class VertexObject{
	uint32_t m_coverage;
	char m_sequence[CONFIG_MAXKMERLENGTH];
	char m_parents[4];
	char m_children[4];
	
public:

	void setSequence(char*value);
	void setCoverage(uint32_t value);
	uint32_t getCoverage()const ;
	void getSequence(string*sequence)const;
	void getParents(vector<string>*parents)const;
	void getChildren(vector<string>*children)const;

	void writeContentInJSON(ostream*stream)const;
	void writeContentInText(ostream*stream)const;

	void addParent(char symbol);
	void addChild(char symbol);
	int getSymbolCode(char symbol)const;
	char getCodeSymbol(int code)const;
};

#endif
