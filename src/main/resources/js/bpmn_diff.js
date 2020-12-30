/**
 * Copyright Ⓒ 2020 "Sberbank Real Estate Center" Limited Liability Company. Licensed under the MIT license.
 * Please, see the LICENSE.md file in project's root for full licensing information.
 */
import { diff } from 'bpmn-js-differ';
import BpmnModdle from 'bpmn-moddle';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import DOMPurify from 'dompurify';

const camundaModdle = require('camunda-bpmn-moddle/resources/camunda.json');

const moddle = new BpmnModdle({ camunda: camundaModdle });
const axios = require('axios').default;

(function($) {
    function loadBpmnSchema(projectKey, repositorySlug, path, commitId) {
        return axios
            .get(
                `${AJS.contextPath()}/rest/api/latest/projects/${projectKey}/repos/${repositorySlug}/raw/${path}?at=${commitId}`
            )
            .then(response => {
                return new Promise(resolve => {
                    resolve(response.data);
                });
            });
    }

    function loadBpmnSchemas(project, repository, path, fromRef, toRef) {
        const requests = [];
        requests.push(loadBpmnSchema(project, repository, path, fromRef));
        requests.push(loadBpmnSchema(project, repository, path, toRef));
        return Promise.all(requests);
    }

    function loadBpmnModel(bpmnSchema) {
        return moddle.fromXML(bpmnSchema);
    }

    function loadBpmnModels(bpmnSchemas) {
        const requests = [];
        requests.push(loadBpmnModel(bpmnSchemas[0]));
        requests.push(loadBpmnModel(bpmnSchemas[1]));
        return Promise.all(requests);
    }

    function drawBpmnSchema(bpmnSchema, bpmnViewer) {
        return bpmnViewer.importXML(bpmnSchema).then(result => {
            return new Promise(resolve => {
                const { warnings } = result;
                console.log('Schema drawn successfully', warnings);
                bpmnViewer.get('canvas').zoom(0.8);
                resolve(bpmnViewer);
            });
        });
    }

    function drawBpmnSchemas(bpmnSchemas, viewers) {
        const requests = [];
        requests.push(drawBpmnSchema(bpmnSchemas[0], viewers[0]));
        requests.push(drawBpmnSchema(bpmnSchemas[1], viewers[1]));
        return Promise.all(requests);
    }

    function createViewers() {
        return new Promise(resolve => {
            const viewers = [];
            viewers.push(
                new BpmnViewer({
                    container: '#canvas-left',
                    height: '100%',
                    width: '100%',
                })
            );
            viewers.push(
                new BpmnViewer({
                    container: '#canvas-right',
                    height: '100%',
                    width: '100%',
                })
            );
            resolve(viewers);
        });
    }

    function addMarker(viewer, elementId, className, symbol) {
        const overlays = viewer.get('overlays');
        try {
            overlays.add(elementId, 'diff', {
                position: {
                    top: -12,
                    right: 12,
                },
                html: `<span class="marker ${DOMPurify.sanitize(className)}">${DOMPurify.sanitize(symbol)}</span>`,
            });
        } catch (e) {
            console.error(`Error adding marker to element ${elementId}`, e);
        }
    }

    function highlight(viewer, elementId, marker) {
        viewer.get('canvas').addMarker(elementId, marker);
    }

    function unhighlight(viewer, elementId, marker) {
        viewer.get('canvas').removeMarker(elementId, marker);
    }

    function showChangesOverview(viewerOld, viewerNew, diff) {
        $('#changes-overview table').remove();

        const changesTable = $(
            '<table>' +
                '<thead><tr><th>#</th><th>Name</th><th>Type</th><th>Change</th></tr></thead>' +
                '</table>'
        );

        let count = 0;
        function addRow(element, type, label) {
            const html =
                `${'<tr class="entry">' + '<td>'}${count++}</td><td>${DOMPurify.sanitize(element.name) || ''}</td>` +
                `<td>${DOMPurify.sanitize(element.$type.replace('bpmn:', ''))}</td>` +
                `<td><span class="status">${DOMPurify.sanitize(label)}</span></td>` +
                `</tr>`;

            const row = $(html)
                .data({
                    changed: type,
                    element: element.id,
                })
                .addClass(type)
                .appendTo(changesTable);
        }

        $.each(diff._removed, (i, obj) => {
            addRow(obj, 'removed', 'Removed');
        });

        $.each(diff._added, (i, obj) => {
            addRow(obj, 'added', 'Added');
        });

        $.each(diff._changed, (i, obj) => {
            addRow(obj.model, 'changed', 'Changed');
        });

        $.each(diff._layoutChanged, (i, obj) => {
            addRow(obj, 'layout-changed', 'Layout Changed');
        });

        changesTable.appendTo('#changes-overview .changes');

        const HIGHLIGHT_CLS = 'highlight';

        $('#changes-overview tr.entry').each((idx, element) => {
            const row = $(element);

            const id = row.data('element');
            const changed = row.data('changed');

            row.hover(
                () => {
                    if (changed === 'removed') {
                        highlight(viewerOld, id, HIGHLIGHT_CLS);
                    } else if (changed === 'added') {
                        highlight(viewerNew, id, HIGHLIGHT_CLS);
                    } else {
                        highlight(viewerOld, id, HIGHLIGHT_CLS);
                        highlight(viewerNew, id, HIGHLIGHT_CLS);
                    }
                },
                () => {
                    if (changed === 'removed') {
                        unhighlight(viewerOld, id, HIGHLIGHT_CLS);
                    } else if (changed === 'added') {
                        unhighlight(viewerNew, id, HIGHLIGHT_CLS);
                    } else {
                        unhighlight(viewerOld, id, HIGHLIGHT_CLS);
                        unhighlight(viewerNew, id, HIGHLIGHT_CLS);
                    }
                }
            );

            row.click(() => {
                const containerWidth = $('.di-container').width();
                const containerHeight = $('.di-container').height();

                const viewers = [];
                if (changed === 'removed') {
                    viewers.push(viewerOld);
                } else if (changed === 'added') {
                    viewers.push(viewerNew);
                } else {
                    viewers.push(viewerOld);
                    viewers.push(viewerNew);
                }

                viewers.forEach(viewer => {
                    const element = viewer.get('elementRegistry').get(id);

                    let x;
                    let y;

                    if (element.waypoints) {
                        x = element.waypoints[0].x;
                        y = element.waypoints[0].y;
                    } else {
                        x = element.x + element.width / 2;
                        y = element.y + element.height / 2;
                    }

                    viewer.get('canvas').viewbox({
                        x: x - containerWidth / 2,
                        y: y - (containerHeight / 2 - 100),
                        width: containerWidth,
                        height: containerHeight,
                    });
                });
            });
        });
    }

    function showDiff(viewerOld, viewerNew, diff) {
        $.each(diff._removed, (i, obj) => {
            highlight(viewerOld, i, 'diff-removed');
            addMarker(viewerOld, i, 'marker-removed', '&minus;');
        });

        $.each(diff._added, (i, obj) => {
            highlight(viewerNew, i, 'diff-added');
            addMarker(viewerNew, i, 'marker-added', '&#43;');
        });

        $.each(diff._layoutChanged, (i, obj) => {
            highlight(viewerOld, i, 'diff-layout-changed');
            addMarker(viewerOld, i, 'marker-layout-changed', '&#8680;');

            highlight(viewerNew, i, 'diff-layout-changed');
            addMarker(viewerNew, i, 'marker-layout-changed', '&#8680;');
        });

        $.each(diff._changed, (i, obj) => {
            highlight(viewerOld, i, 'diff-changed');
            addMarker(viewerOld, i, 'marker-changed', '&#9998;');

            highlight(viewerNew, i, 'diff-changed');
            addMarker(viewerNew, i, 'marker-changed', '&#9998;');

            let details = '<table ><tr><th>Attribute</th><th>old</th><th>new</th></tr>';
            $.each(obj.attrs, (attr, changes) => {
                details =
                    `${details}<tr>` +
                    `<td>${DOMPurify.sanitize(attr)}</td><td>${DOMPurify.sanitize(changes.oldValue)}</td>` +
                    `<td>${DOMPurify.sanitize(changes.newValue)}</td>` +
                    `</tr>`;
            });

            details += '</table></div>';
            $(viewerOld.get('elementRegistry').getGraphics(i)).click(event => {
                $(`#changeDetailsOld_${i}`).toggle();
            });

            const detailsOld = `<div id="changeDetailsOld_${i}" class="changeDetails">${details}`;
            viewerOld.get('overlays').add(i, 'diff', {
                position: {
                    bottom: -5,
                    left: 0,
                },
                html: detailsOld,
            });

            $(`#changeDetailsOld_${i}`).toggle();

            $(viewerNew.get('elementRegistry').getGraphics(i)).click(event => {
                $(`#changeDetailsNew_${i}`).toggle();
            });

            const detailsNew = `<div id="changeDetailsNew_${i}" class="changeDetails">${details}`;
            // attach an overlay to a node
            viewerNew.get('overlays').add(i, 'diff', {
                position: {
                    bottom: -5,
                    left: 0,
                },
                html: detailsNew,
            });

            $(`#changeDetailsNew_${i}`).toggle();
        });

        showChangesOverview(viewerOld, viewerNew, diff);
    }

    function setContentHeight() {
        $('.content').css(
            'height',
            $(window).height() - $('.aui-header').height() - $('#footer').height()
        );
    }

    $(document).ready(() => {
        setContentHeight();

        $('#changes-overview .show-hide-toggle').click(() => {
            $('#changes-overview').toggleClass('collapsed');
        });

        const urlParams = new URLSearchParams(window.location.search);

        const project = urlParams.get('project');
        const repository = urlParams.get('repository');
        const path = urlParams.get('path');
        const fromRef = urlParams.get('fromRef');
        const toRef = urlParams.get('toRef');

        createViewers()
            .then(viewers => {
                loadBpmnSchemas(project, repository, path, fromRef, toRef)
                    .then(bpmnSchemas => {
                        drawBpmnSchemas(bpmnSchemas, viewers).then(() =>
                            viewers[0].get('canvas').viewbox(viewers[1].get('canvas').viewbox())
                        );
                        return loadBpmnModels(bpmnSchemas);
                    })
                    .then(models => {
                        const diffResult = diff(models[0].rootElement, models[1].rootElement);
                        console.log(diffResult);

                        showDiff(viewers[0], viewers[1], diffResult);
                    });
            })
            .catch(error => console.error('Error processing BPMN diff', error));
    });

    $(window).resize(() => setContentHeight());
})(AJS.$);
