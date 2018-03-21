/**
 * @license
 * Copyright 2013 Palantir Technologies, Inc.
 */

// TODO: validate rule options

import * as changeCase from "change-case";
import * as Lint from "tslint";
import * as ts from "typescript";

const OPT_CAMEL_CASE = "camelCase";
const OPT_CONSTANT_CASE = "constantCase";
const OPT_PASCAL_CASE = "pascalCase";
const OPT_SNAKE_CASE = "snakeCase";

const RULE_NAME = "ensure-named-export";

const SUPPORTED_CASES = [
    OPT_CAMEL_CASE,
    OPT_CONSTANT_CASE,
    OPT_PASCAL_CASE,
    OPT_SNAKE_CASE,
];

const SUPPORTED_CASES_STRING = SUPPORTED_CASES.map(x => `"${x}"`).join(", ");

const isSupportedCase = (c: string) => SUPPORTED_CASES.indexOf(c) !== -1;

const identity = (x) => x;
export class Rule extends Lint.Rules.AbstractRule {
    /* tslint:disable:object-literal-sort-keys */
    public static metadata: Lint.IRuleMetadata = {
        ruleName: RULE_NAME,
        description: "Ensures that a module has an export with a name corresponding to the file name",
        hasFix: false,
        optionsDescription: Lint.Utils.dedent`
            If no option is specified, then the rule will check for named export matching file name exactly.`,
        options: {
            type: "string",
            enum: SUPPORTED_CASES,
        },
        optionExamples: [
            true,
            [true, OPT_CAMEL_CASE],
        ],
        type: "style",
        typescriptOnly: false,
    };
    /* tslint:enable:object-literal-sort-keys */

    public static FAILURE_STRING = (expectedExportName: string) =>
        `module must have an export corresponding to file name (expected export name "${expectedExportName}")`

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const options = this.getOptions();
        let filenameToExportName = identity;
        if (options.ruleArguments && options.ruleArguments.length > 0) {
            const [toCase] = options.ruleArguments;
            const toCaseFunction = changeCase[toCase];

            if (!isSupportedCase(toCase)) {
                throw new Error(`[${RULE_NAME}]: The "${toCase}" case is not supported (Supported cases: ${SUPPORTED_CASES_STRING})`);
            }

            if (!(toCaseFunction instanceof Function)) {
                throw new Error(`[${RULE_NAME}] Implementation for the "${toCase}" case was not found`);
            }

            filenameToExportName = toCaseFunction;
        }
        return this.applyWithFunction(sourceFile, walk(filenameToExportName));
    }
}

const hasModifiers = (s: ts.Statement) => s.modifiers !== undefined && s.modifiers.length >= 1;
const createNameMatcher = (filename: string) => (decl) =>
    decl.kind === ts.SyntaxKind.VariableDeclaration && decl.name.text === filename;

const walk = (filenameToExportName: (filename: string) => string) => (ctx: Lint.WalkContext<void>) => {
    // Skip declaration files and external modules (WTF is the later one?)
    if (ctx.sourceFile.isDeclarationFile || !ts.isExternalModule(ctx.sourceFile)) {
        return;
    }

    // Prepare file name for comparision
    const filename = ctx.sourceFile.fileName.match(/\/([^\/]+)\.ts$/)[1];
    const expectedExportName = filenameToExportName(filename);
    const hasExpectedName = createNameMatcher(expectedExportName);
    const declarationsWithExpectedName = [];

    for (const statement of ctx.sourceFile.statements) {
        // If has `export` modifier
        // TODO: maybe should not check if the export is default: keep the rule scope focused
        if (hasModifiers(statement) && statement.modifiers[0].kind === ts.SyntaxKind.ExportKeyword) {
            if (statement.kind === ts.SyntaxKind.VariableStatement) {
                (statement as ts.VariableStatement).declarationList.declarations
                    .reduce((all, next) => hasExpectedName(next) ? (all.push(next), all) : all, declarationsWithExpectedName);
            }
        }
    }

    if (declarationsWithExpectedName.length === 0) {
        // TODO: the failure semantically relates to the whole module, but not the specific node
        ctx.addFailureAt(0, 0, Rule.FAILURE_STRING(expectedExportName));
    }
}
