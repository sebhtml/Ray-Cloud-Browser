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

#ifndef _JSONParser_h
#define _JSONParser_h

#define JSONParser_TYPE_OBJECT 0
#define JSONParser_TYPE_ARRAY 1
#define JSONParser_TYPE_STRING 2
#define JSONParser_TYPE_INTEGER 3
#define JSONParser_TYPE_DOUBLE 4

#include "Mapper.h"

#include <string>
#include <vector>
using namespace std;

/**
 * TODO: split in many classes
 * TODO: support comments in JSON
 * TODO: support ' for strings
 *
 * \author Sébastien Boisvert
 */
class JSONParser{

	bool m_debug;

	Mapper m_mapper;
	int m_type;
	const char*m_content;
	int m_start;
	int m_end;

	vector<JSONParser> m_associativeKeyContent;
	vector<JSONParser> m_associativeValueContent;

	vector<JSONParser> m_arrayContent;

	string m_stringContent;

	int64_t m_integerContent;

	double m_doubleContent;

	void parseContent();
	void parseObject();
	void parseArray();
	void parseString();
	void parseInteger();
	void parseDouble();

	void pullContent(JSONParser*node,int position);
	void pullObject(JSONParser*node,int position);
	void pullArray(JSONParser*node,int position);
	void pullString(JSONParser*node,int position);
	void pullInteger(JSONParser*node,int position);
	void pullDouble(JSONParser*node,int position);

	void create(int type,const char*content,int start,int end);

	int getType();
	int getStart();
	int getEnd();

	void print(int depth);
	void addSpaces(int space);

	bool isDigitSymbol(char symbol);
public:

	JSONParser();

	void parse(const char*file);
	void printFile();
	void debug();
};

#endif

