import type { Plugin } from 'graphql-yoga';
import { register as defaultRegistry } from 'prom-client';
import {
  createHistogram,
  type PrometheusTracingPluginConfig as EnvelopPrometheusTracingPluginConfig,
  usePrometheus as useEnvelopPrometheus,
} from '@envelop/prometheus';


export interface PrometheusTracingPluginConfig extends EnvelopPrometheusTracingPluginConfig {
  http?: boolean | string | ReturnType<typeof createHistogram>;

  /**
   * The endpoint to serve metrics exposed by this plugin.
   * Defaults to "/metrics".
   */
  endpoint?: string | boolean;
}

export function useMetricsPlugin(options: PrometheusTracingPluginConfig): Plugin {
  const endpoint = options.endpoint || '/metrics';
  const registry = options.registry || defaultRegistry;

  return {
    onPluginInit({ addPlugin }) {
      addPlugin(useEnvelopPrometheus({ ...options, registry }) as Plugin);
    },
    onRequest({ url, fetchAPI, endResponse }) {
      if (endpoint && url.pathname === endpoint) {
        return registry.metrics().then(metrics => {
          endResponse(
            new fetchAPI.Response(metrics, {
              headers: {
                'Content-Type': registry.contentType,
              },
            }),
          );
        });
      }
      return undefined;
    }
  };
}