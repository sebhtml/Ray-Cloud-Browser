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

#ifndef _Client_h
#define _Client_h

#include <commands/CommandInterface.h>

#include <commands/ObjectFetcher.h>
#include <commands/GraphManager.h>
#include <commands/AnnotationManager.h>
#include <commands/AnnotationReporter.h>
#include <commands/PathHelper.h>
#include <commands/Explorer.h>
#include <commands/MapDescriber.h>
#include <commands/PathProbe.h>
#include <commands/Parser.h>
#include <commands/GraphExporter.h>
#include <commands/ObjectAnnotationList.h>
#include <commands/ConfigurationReader.h>

#include <map>
#include <string>
using namespace std;

/**
 * Command-line client.
 *
 * \author Sébastien Boisvert
 */
class Client{

	PathHelper m_pathHelper;
	GraphManager m_graphManager;
	AnnotationManager m_annotationManager;
	ObjectFetcher m_objectFetcher;
	ObjectAnnotationList m_objectAnnotationList;
	AnnotationReporter m_annotationReporter;
	Explorer m_explorer;
	MapDescriber m_mapDescriber;
	PathProbe m_pathProbe;
	Parser m_parser;
	ConfigurationReader m_configurationReader;
	GraphExporter m_graphExporter;

	map<string,CommandInterface*> m_dispatcher;

	void showUsage();
	void registerAction(const char*actionName,CommandInterface*actionHandler);
public:

	Client();
	int call(int argc,char**argv);
};

#endif
