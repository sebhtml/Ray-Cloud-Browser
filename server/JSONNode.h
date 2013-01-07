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

#ifndef _JSONNode_h
#define _JSONNode_h

#define JSONNode_TYPE_OBJECT 0
#define JSONNode_TYPE_ARRAY 1
#define JSONNode_TYPE_STRING 2
#define JSONNode_TYPE_INTEGER 3
#define JSONNode_TYPE_DOUBLE 4

#include <string>
#include <vector>
using namespace std;

#include <stdint.h>

/**
 * TODO: split in many classes
 * TODO: support comments in JSON
 * TODO: support ' for strings
 *
 * \author Sébastien Boisvert
 */
class JSONNode{

	bool m_debug;
	int m_type;
	const char*m_content;
	int m_start;
	int m_end;

	vector<JSONNode> m_associativeKeyContent;
	vector<JSONNode> m_associativeValueContent;

	vector<JSONNode> m_arrayContent;

	string m_stringContent;

	int64_t m_integerContent;

	double m_doubleContent;

	void parseContent();
	void parseObject();
	void parseArray();
	void parseString();
	void parseInteger();
	void parseDouble();

	void pullContent(JSONNode*node,int position);
	void pullObject(JSONNode*node,int position);
	void pullArray(JSONNode*node,int position);
	void pullString(JSONNode*node,int position);
	void pullInteger(JSONNode*node,int position);
	void pullDouble(JSONNode*node,int position);

	int getStart();
	int getEnd();

	void addSpaces(int space);

	bool isDigitSymbol(char symbol);

public:

	JSONNode();
	void create(int type,const char*content,int start,int end);
	void debug();
	void print(int depth);
	int getType();
	int64_t getInteger();
	string*getString();
	JSONNode*getArrayElement(int index);
	JSONNode*getObjectKey(int index);
	JSONNode*getObjectValue(int index);
	int getArraySize();
	int getObjectSize();
};

#endif


